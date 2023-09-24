

// Exported function to fetch data and perform statistics
export function fetchDataAndPerformStatistics() {
  let outcomesData = [];
  db.collection('outcomes').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      outcomesData.push(doc.data());
    });
    // Perform statistics
    performStatistics(outcomesData);
  });
}

function performStatistics(data) {
  // Total data points
  const totalDataPoints = data.length;
  
  // Transform outcomes to numerical values
  const numericalData = data.map(item => ({
    combinedScore: parseInt(item.leftLegStrength) + parseInt(item.rightLegStrength),
    outcome: item.outcome === 'Walked' ? 1 : 0
  }));
  
  // Calculate correlation
  const combinedScores = numericalData.map(item => item.combinedScore);
  const outcomes = numericalData.map(item => item.outcome);
  const correlation = calculateCorrelation(combinedScores, outcomes);
  
  // Log or display the results (this can be changed as needed)
  console.log(`Total data points: ${totalDataPoints}`);
  console.log(`Correlation between combined score and outcome: ${correlation}`);

document.getElementById("statisticalOutput").innerHTML = `
  <p>Total data points: ${totalDataPoints}</p>
  <p>Correlation between combined score and outcome: ${correlation}</p>
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
