import { FiPlusCircle } from 'react-icons/fi'
import Header from '../../components/Header'
import Title from '../../components/Title'
import './style.css'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../contexts/auth'
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { toast } from "react-toastify";
import { useNavigate, useParams } from 'react-router-dom'

const listRef = collection(db, 'customers')

export default function NewTicket() {

    const { id } = useParams()
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    const [customers, setCustomers] = useState([])
    const [loadCustomer, setLoadCustomer] = useState(true)
    const [customerSelected, setCustomerSelected] = useState(0)

    const [description, setDescription] = useState('')
    const [subject, setSubject] = useState('Support')
    const [status, setStatus] = useState('Open')

    const [idCustomer, setIdCustomer] = useState(false)

    useEffect(() => {
        async function loadCustomers() {
            const querySnapshot = await getDocs(listRef)
                .then((snapshot) => {
                    let list = []

                    snapshot.forEach((doc) => {
                        list.push({
                            id: doc.id,
                            companyName: doc.data().companyName
                        })
                    })

                    if (snapshot.docs.size === 0) {
                        console.log("No companies were found...")
                        setCustomers([{
                            id: 1
                            , companyName: 'Company'
                        }])
                        setLoadCustomer(false)
                        return;
                    }

                    setCustomers(list)
                    setLoadCustomer(false)

                    if (id) {
                        loadId(list)
                    }
                })
                .catch((error) => {
                    console.log("error serching clients: " + error)
                    setLoadCustomer(false)
                    setCustomers([{
                        id: 1
                        , companyName: 'Company'
                    }])
                })
        }

        loadCustomers();
    }, [])

    async function loadId(list) {
        const docRef = doc(db, "tickets", id)
        await getDoc(docRef)
            .then((snapshot) => {
                setSubject(snapshot.data().subject)
                setStatus(snapshot.data().status)
                setDescription(snapshot.data().description)

                let index = list.findIndex(item => item.id === snapshot.data().clientId)
                setCustomerSelected(index)
                setIdCustomer(true)
            })
            .catch((error) => {
                console.log(error)
                setIdCustomer(false)
            })
    }

    async function handleRegister(e) {
        e.preventDefault()

        if (idCustomer) {

            const docRef = doc(db, 'tickets', id)
            await updateDoc(docRef, {
                client: customers[customerSelected].companyName,
                clientId: customers[customerSelected].id,
                subject: subject,
                description: description,
                status: status,
                userId: user.uid
            })
            .then(() => {
                toast.info("Ticket updated successfully")
                navigate('/dashboard')
            })
            .catch((error) => {
                toast.error("Error updating ticket")
                console.log(error)
            })

            return;
        }

        await addDoc(collection(db, 'tickets'), {
            created_at: new Date(),
            client: customers[customerSelected].companyName,
            clientId: customers[customerSelected].id,
            subject: subject,
            description: description,
            status: status,
            userId: user.uid
        })
            .then(() => {
                toast.success("Ticket registered successfully")
                setDescription('')
                setCustomerSelected(0)
                navigate('/dashboard')
            })
            .catch((error) => {
                toast.error("Error registering ticket")
                console.log(error)
            })
    }

    function handleOptionChange(e) {
        setStatus(e.target.value)
    }

    function handleChangeSelect(e) {
        setSubject(e.target.value)
    }

    function handleChangeCustomer(e) {
        setCustomerSelected(e.target.value)
    }

    return (
        <div>
            <Header />

            <div className="content">
                <Title name={id ? 'Update Ticket' : 'New Ticket'}>
                    <FiPlusCircle size={24} />
                </Title>

                <div className="container">
                    <form className="form-profile" onSubmit={handleRegister}>
                        <label>Customer</label>
                        {
                            loadCustomer ? (
                                <input type="text" disabled={true} value="Carregando..." />
                            ) : (
                                <select value={customerSelected} onChange={handleChangeCustomer}>
                                    {customers.map((item, index) => {
                                        return (
                                            <option key={index} value={index}>
                                                {item.companyName}
                                            </option>
                                        )
                                    })}
                                </select>
                            )
                        }

                        <label>Subject</label>
                        <select value={subject} onChange={handleChangeSelect}>
                            <option value={"Support"}>Support</option>
                            <option value={"Technical visit"}>Technical visit</option>
                            <option value={"Financial"}>Financial</option>
                        </select>

                        <label>Status</label>
                        <div className="status">
                            <input
                                type='radio'
                                name='radio'
                                value={'Open'}
                                onChange={handleOptionChange}
                                checked={status === 'Open'}
                            /> <span>Open</span>
                            <input
                                type='radio'
                                name='radio'
                                value={'Progress'}
                                onChange={handleOptionChange}
                                checked={status === 'Progress'}
                            /> <span>In progress</span>
                            <input
                                type='radio'
                                name='radio'
                                value={'Answered'}
                                onChange={handleOptionChange}
                                checked={status === 'Answered'}
                            /> <span>Answered</span>
                        </div>

                        <label>Description</label>
                        <textarea
                            type="text"
                            placeholder='Describe your issue (optional)'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <button type="submit">Submit</button>
                    </form>
                </div>

            </div>
        </div>
    )
}