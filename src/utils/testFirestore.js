const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAa8EyjkOO4_QTySQW8j7xZpj8oFm93UdI",
  authDomain: "kerjapraktik-73563.firebaseapp.com",
  projectId: "kerjapraktik-73563",
  storageBucket: "kerjapraktik-73563.appspot.com",
  messagingSenderId: "36255564527",
  appId: "1:36255564527:android:25483ade547bdbd271911a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFirestore() {
  try {
    // First, sign in with a test user
    const userCredential = await signInWithEmailAndPassword(auth, "definite.pinniped.zdn@instantletter.net", "123456");
    console.log('Successfully signed in');

    // Try to write a test document
    const testDoc = await addDoc(collection(db, 'test_collection'), {
      message: 'Test document',
      timestamp: new Date(),
      userId: userCredential.user.uid
    });
    console.log('Successfully wrote test document with ID:', testDoc.id);

    // Try to read from the test collection
    const querySnapshot = await getDocs(collection(db, 'test_collection'));
    console.log('\nReading all documents in test_collection:');
    querySnapshot.forEach((doc) => {
      console.log(`Document ${doc.id}:`, doc.data());
    });

    console.log('\nFirestore database is working properly!');
  } catch (error) {
    console.error('Error testing Firestore:', error);
  }
}

testFirestore();
