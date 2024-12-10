import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { setUser } from '../store/slices/authSlice';

const FirebaseInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          if (!userData || !userData.role) {
            console.error('No user data or role found in Firestore');
            await auth.signOut();
            dispatch(setUser(null));
            return;
          }
          
          dispatch(setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userData.name,
            role: userData.role
          }));
        } catch (error) {
          console.error('Error fetching user data:', error);
          await auth.signOut();
          dispatch(setUser(null));
        }
      } else {
        dispatch(setUser(null));
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [dispatch]);

  return null;
};

export default FirebaseInit;
