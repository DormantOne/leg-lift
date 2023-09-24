// Import Firebase Firestore
import firebase from "firebase/app";
import "firebase/firestore";

// Initialize Firestore
const db = firebase.firestore();

// Exported function to fetch data and perform statistics
export function fetchDataAndPerformStatistics() {
  let outcomesData = [];
  let dataPointIds = [];  // To store the IDs of each data point
  db.collection('outcomes').get().then(async (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      outcomesData.push(doc.data());
      dataPointIds.push(doc.id);  // Store the ID of each data point
    });
    // Perform statistics and save them to Firebase
    await performStatistics(outcomesData, dataPointIds);
  });
}

async function performStatistics(data, dataPointIds) {
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

  // Prepare the statistics object
  const statistics = {
    totalDataPoints: totalDataPoints,
    correlation: correlation,
    dataPointIds: dataPointIds
  };

  // Save the statistics to Firebase
  const statsDocRef = await db.collection('statistics').add({
    ...statistics,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Add the Firestore document ID to the statistics object
  statistics.id = statsDocRef.id;

  // Update the DOM
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
