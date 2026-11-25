import { FiUsers } from "react-icons/fi";
import Header from "../../components/Header";
import Title from "../../components/Title";
import { AuthContext } from "../../contexts/auth";
import { useContext, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../services/firebase";
import { toast } from "react-toastify";

export default function Customers() {

    const { user } = useContext(AuthContext)
    const [name, setName] = useState('')
    const [cnpj, setCnpj] = useState('')
    const [address, setAddress] = useState('')

    async function handleRegister(e) {
        e.preventDefault()

        if (name !== '' && cnpj !== '' && address) {
            await addDoc(collection(db, "customers"), {
                userId: user.uid,
                companyName: name,
                cnpj,
                address
            })
                .then(() => {
                    setName('')
                    setCnpj('')
                    setAddress('')
                    toast.success("Company registered!")
                })
                .catch((error) => {
                  console.log(error)
                  toast.error("Error registering company!")
                })

        } else {
            toast.error("Please fill in all fields.")
        }
    }

    return (
        <div>
            <Header />
            <div className="content">
                <Title name={"Customers"}>
                    <FiUsers size={25} />
                </Title>

                <div className="container">
                    <form className="form-profile" onSubmit={handleRegister}>
                        <label>Company name</label>
                        <input type="text" placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)} />
                        <input type="text" placeholder="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                        <input type="text" placeholder="Adress" value={address} onChange={(e) => setAddress(e.target.value)} />

                        <button type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    )
}