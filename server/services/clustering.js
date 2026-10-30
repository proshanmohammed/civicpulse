/**
 * Haversine distance in meters between two lat/lng coordinates
 */
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Computes geographic clusters using density-based spatial proximity (DBSCAN / Radius clustering)
 * Default proximity threshold: 450 meters
 */
export function computeGeographicClusters(reports, maxDistanceMeters = 450, minClusterSize = 2) {
  if (!reports || reports.length === 0) return [];

  const visited = new Set();
  const clusters = [];

  for (let i = 0; i < reports.length; i++) {
    const reportA = reports[i];
    if (visited.has(reportA.id)) continue;

    // Find all neighbors within maxDistanceMeters
    const neighbors = [reportA];
    for (let j = 0; j < reports.length; j++) {
      if (i === j) continue;
      const reportB = reports[j];
      const dist = getDistanceMeters(reportA.latitude, reportA.longitude, reportB.latitude, reportB.longitude);
      if (dist <= maxDistanceMeters) {
        neighbors.push(reportB);
      }
    }

    if (neighbors.length >= minClusterSize) {
      neighbors.forEach(n => visited.add(n.id));

      // Calculate centroid
      const totalLat = neighbors.reduce((acc, curr) => acc + curr.latitude, 0);
      const totalLon = neighbors.reduce((acc, curr) => acc + curr.longitude, 0);
      const centerLat = Number((totalLat / neighbors.length).toFixed(6));
      const centerLon = Number((totalLon / neighbors.length).toFixed(6));

      // Determine category breakdown & dominant category
      const categoryCounts = {};
      let maxCat = neighbors[0].category;
      let maxCount = 0;
      let maxPriorityScore = 0;
      let hasCritical = false;

      neighbors.forEach(r => {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
        if (categoryCounts[r.category] > maxCount) {
          maxCount = categoryCounts[r.category];
          maxCat = r.category;
        }
        if (r.priority_score > maxPriorityScore) {
          maxPriorityScore = r.priority_score;
        }
        if (r.priority === 'Critical' || r.priority_score >= 90) {
          hasCritical = true;
        }
      });

      // Cluster Severity
      let severity = 'Moderate';
      if (hasCritical || maxPriorityScore >= 90 || neighbors.length >= 5) {
        severity = 'Critical';
      } else if (maxPriorityScore >= 70 || neighbors.length >= 3) {
        severity = 'High';
      }

      // Generate localized area name based on reports addresses or category
      const sampleAddress = neighbors.find(r => r.address)?.address || `Sector ${Math.round(centerLat * 100) % 20 + 1}`;
      const streetOrArea = extractAreaName(sampleAddress);
      const clusterTitle = `${streetOrArea} - ${formatCategory(maxCat)} Hotspot`;

      // Generate Executive Cluster Action Brief
      const actionBrief = generateClusterActionBrief(clusterTitle, maxCat, neighbors.length, severity);

      clusters.push({
        id: `cluster-${clusters.length + 1}`,
        title: clusterTitle,
        dominant_category: maxCat,
        severity,
        report_count: neighbors.length,
        max_priority_score: maxPriorityScore,
        center: {
          latitude: centerLat,
          longitude: centerLon
        },
        radius_meters: Math.round(maxDistanceMeters),
        category_distribution: categoryCounts,
        executive_action_brief: actionBrief,
        reports: neighbors.map(r => ({
          id: r.id,
          title: r.title,
          category: r.category,
          priority: r.priority,
          priority_score: r.priority_score,
          status: r.status,
          latitude: r.latitude,
          longitude: r.longitude,
          address: r.address,
          ai_summary: r.ai_summary
        }))
      });
    }
  }

  // Sort clusters by severity and report count
  return clusters.sort((a, b) => {
    const sevWeight = { Critical: 3, High: 2, Moderate: 1 };
    const diff = (sevWeight[b.severity] || 0) - (sevWeight[a.severity] || 0);
    if (diff !== 0) return diff;
    return b.report_count - a.report_count;
  });
}

function extractAreaName(address) {
  if (!address) return 'Central Corridor';
  const parts = address.split(',');
  return parts[0].trim();
}

function formatCategory(cat) {
  const map = {
    waterlogging: 'Drainage & Inundation',
    roads: 'Road & Pavement Hazard',
    waste: 'Sanitation Waste',
    streetlights: 'Dark Corridor / Streetlight',
    electrical: 'High-Voltage Electrical Hazard'
  };
  return map[cat] || cat.toUpperCase();
}

function generateClusterActionBrief(title, category, count, severity) {
  if (category === 'electrical') {
    return `EMERGENCY ALERT: ${count} active electrical hazard reports detected in close proximity. High risk of community electrocution or transformer overload. Dispatch emergency grid crew with insulated gear for immediate circuit de-energization and isolation.`;
  }
  if (category === 'waterlogging') {
    return `CRITICAL DRAINAGE BOTTLENECK: High spatial concentration (${count} reports) indicates systemic storm-sewer obstruction or broken main water conduit. Dispatch municipal suction tanker and mobile pumping station to prevent structural flooding.`;
  }
  if (category === 'roads') {
    return `HIGH-RISK ARTERIAL ROADWAY: Severe pavement deterioration and cratering reported ${count} times within 400m. Recommend deploying rapid road-resurfacing truck and high-visibility traffic cones to prevent vehicular collisions.`;
  }
  if (category === 'waste') {
    return `SANITATION ACCUMULATION ZONE: Chronic waste overflow (${count} reports) posing significant public health and pest vector risk. Deploy two rear-loader compactor trucks and schedule bio-disinfection wash.`;
  }
  if (category === 'streetlights') {
    return `PUBLIC SAFETY DARK ZONE: Multi-pole illumination outage (${count} reports) creating pedestrian security risks. Dispatch municipal bucket truck to inspect feeder pillar and replace LED fixtures.`;
  }
  return `Multi-disciplinary taskforce recommended: ${count} civic grievances clustered in immediate perimeter. Priority: ${severity}.`;
}
