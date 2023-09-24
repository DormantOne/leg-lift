// Assuming Firebase is already included and initialized in your HTML

const db = firebase.firestore();  // Firebase should be initialized in the HTML

function fetchDataAndPerformStatistics() {
  let outcomesData = [];
  let dataPointIds = [];
  db.collection('outcomes').get().then(async (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      outcomesData.push(doc.data());
      dataPointIds.push(doc.id);
    });
    await performStatistics(outcomesData, dataPointIds);
  });
}

async function performStatistics(data, dataPointIds) {
  const totalDataPoints = data.length;
  const numericalData = data.map(item => ({
    combinedScore: parseInt(item.leftLegStrength) + parseInt(item.rightLegStrength),
    outcome: item.outcome === 'Walked' ? 1 : 0
  }));

  const combinedScores = numericalData.map(item => item.combinedScore);
  const outcomes = numericalData.map(item => item.outcome);
  const correlation = calculateCorrelation(combinedScores, outcomes);

  const statistics = {
    totalDataPoints: totalDataPoints,
    correlation: correlation,
    dataPointIds: dataPointIds
  };

  const statsDocRef = await db.collection('statistics').add({
    ...statistics,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  statistics.id = statsDocRef.id;

  document.getElementById("statisticsOutput").innerHTML = `
    <p>Total data points: ${totalDataPoints}</p>
    <p>Correlation between combined score and outcome: ${correlation}</p>
    <p>Statistics ID: ${statistics.id}</p>
  `;
}

// Function to calculate Pearson correlation
function calculateCorrelation(x, y) {
  const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
  const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
  
  let num = 0;
  let denX = 0;
  let denY = 0;
  
  for(let i = 0; i < x.length; i++) {
    num += (x[i] - meanX) * (y[i] - meanY);
    denX += Math.pow(x[i] - meanX, 2);
    denY += Math.pow(y[i] - meanY, 2);
  }
  
  return num / Math.sqrt(denX * denY);
}

// Attach to the global window object if you want to call it from the HTML
window.fetchDataAndPerformStatistics = fetchDataAndPerformStatistics;
