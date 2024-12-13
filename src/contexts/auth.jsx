import { useState, createContext, useEffect } from "react";
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AuthContext = createContext({});

function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);

    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        async function loadUser() {
            const storageUser = localStorage.getItem('@support-tickets');

            if (storageUser) {
                setUser(JSON.parse(storageUser));
                setLoading(false);
            }


            setLoading(false);

        }

        loadUser();
    }, [])

    async function signIn(email, password) {

        setLoadingAuth(true);

        await signInWithEmailAndPassword(auth, email, password)
            .then(async (val) => {
                let uid = val.user.uid;

                const docRef = doc(db, "users", uid);
                const docSnap = await getDoc(docRef)

                let data = {
                    uid: uid,
                    username: docSnap.data().username,
                    email: val.user.email,
                    avatarUrl: docSnap.data().avatarUrl
                }
                setUser(data);
                storeUser(data);
                toast.success("User logged in successfully!");
                setLoadingAuth(false);
                navigate("/dashboard");
            })
            .catch((error) => {
                toast.error("ERROR LOGGING IN: " + error);
                setLoadingAuth(false);
            })
    }

    async function signUp(email, password, username) {

        setLoadingAuth(true);

        await createUserWithEmailAndPassword(auth, email, password)
            .then(async (val) => {
                let uid = val.user.uid

                await setDoc(doc(db, 'users', uid), {
                    username: username,
                    avatarUrl: null,
                })
                    .then(() => {
                        let data = {
                            uid: uid,
                            username: user,
                            email: val.user.email,
                            avatarUrl: avatarUrl
                        }
                        setUser(data);
                        storeUser(data);
                        toast.success("User registered successfully!");
                        setLoadingAuth(false);
                        navigate("/dashboard");
                    })
                    .catch((error) => {
                        toast.error("ERROR WRITING ON DB: " + error);
                        setLoadingAuth(false);
                    })
            })
            .catch((error) => {
                toast.error("ERROR CREATING USER: " + error);
                setLoadingAuth(false);
            })
    }

    function storeUser(data) {
        localStorage.setItem("@support-tickets", JSON.stringify(data));
    }

    async function logout() {
        if(!confirm("Do you with to log out, "+ user.username + "?")){
            return
        }
        await signOut(auth);
        localStorage.removeItem("@support-tickets");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                signed: !!user,
                user,
                signIn,
                signUp,
                logout,
                loadingAuth,
                loading,
                storeUser,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
