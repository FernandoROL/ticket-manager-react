import { useState, createContext, useEffect } from "react";
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export const AuthContext = createContext({});

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeProfile;
        localStorage.removeItem('@support-tickets');
        const unsubscribeAuth = onAuthStateChanged(auth, account => {
            unsubscribeProfile?.();
            setUser(null);
            if (!account) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const base = { uid: account.uid, email: account.email, username: account.email, avatarUrl: null };
            unsubscribeProfile = onSnapshot(doc(db, 'users', account.uid), snapshot => {
                const profile = snapshot.data();
                setUser({ ...base, username: profile?.username ?? base.username, avatarUrl: profile?.avatarUrl ?? null });
                setLoading(false);
            }, error => {
                setUser(base);
                setLoading(false);
                toast.error('Signed in, but the profile could not be read from Firestore (' + error.code + ').');
            });
        });
        return () => {
            unsubscribeAuth();
            unsubscribeProfile?.();
        };
    }, []);

    async function signIn(email, password) {
        setLoadingAuth(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            toast.error('Sign-in failed: ' + error.message);
        } finally {
            setLoadingAuth(false);
        }
    }

    async function signUp(email, password, username) {
        setLoadingAuth(true);
        try {
            const { user: account } = await createUserWithEmailAndPassword(auth, email, password);
            try {
                await setDoc(doc(db, 'users', account.uid), { username, avatarUrl: null });
                toast.success('Account created!');
            } catch (error) {
                toast.error('Account created, but the profile could not be saved (' + error.code + ').');
            }
        } catch (error) {
            toast.error('Registration failed: ' + error.message);
        } finally {
            setLoadingAuth(false);
        }
    }

    async function logout() {
        if (confirm('Log out, ' + user.username + '?')) await signOut(auth);
    }

    return (
        <AuthContext.Provider value={{ signed: !!user, user, signIn, signUp, logout, loadingAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
