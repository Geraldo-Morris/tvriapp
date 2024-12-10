const { initializeApp } = require('firebase/app');
const {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} = require('firebase/auth');
const {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} = require('firebase/firestore');

// Your web app's Firebase configuration
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

// Initial operator details
const operatorDetails = {
  email: "operator@tvri.com", // Change this to your desired email
  password: "operator123456", // Change this to your desired password
  name: "TVRI Operator"       // Change this to your desired name
};

async function createInitialOperator() {
  try {
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      operatorDetails.email,
      operatorDetails.password
    );

    // Update the user's profile
    await updateProfile(userCredential.user, {
      displayName: operatorDetails.name
    });

    // Add user data to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: operatorDetails.email,
      name: operatorDetails.name,
      role: 'operator',
      createdAt: serverTimestamp()
    });

    console.log('Initial operator account created successfully!');
    console.log('Email:', operatorDetails.email);
    console.log('Password:', operatorDetails.password);
    console.log('Name:', operatorDetails.name);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating initial operator:', error);
    process.exit(1);
  }
}

createInitialOperator();
