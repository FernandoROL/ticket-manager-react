import { FiPlusCircle } from 'react-icons/fi'
import Header from '../../components/Header'
import Title from '../../components/Title'
import './style.css'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../contexts/auth'
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from 'react-router-dom'

const listRef = collection(db, 'customers')

export default function NewTicket() {

    const { id } = useParams()
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    const [customers, setCustomers] = useState([])
    const [loadCustomer, setLoadCustomer] = useState(true)
    const [customerSelected, setCustomerSelected] = useState('')

    const [description, setDescription] = useState('')
    const [subject, setSubject] = useState('Support')
    const [status, setStatus] = useState('Open')

    const [loadError, setLoadError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let active = true
        async function loadForm() {
            setLoadCustomer(true)
            setLoadError('')
            try {
                const [snapshot, ticket] = await Promise.all([
                    getDocs(query(listRef, where('userId', '==', user.uid))),
                    id ? getDoc(doc(db, 'tickets', id)) : null
                ])
                if (!active) return
                if (id && (!ticket.exists() || ticket.data().userId !== user.uid)) {
                    setLoadError('Ticket not found.')
                    return
                }

                const list = snapshot.docs.map(customer => ({
                    id: customer.id,
                    companyName: customer.data().companyName
                }))
                const data = ticket?.data()
                setCustomers(list)
                setCustomerSelected(data ? data.clientId : list[0]?.id ?? '')
                setSubject(data?.subject ?? 'Support')
                setStatus(data?.status ?? 'Open')
                setDescription(data?.description ?? '')
            } catch (error) {
                if (active) setLoadError('Could not open this form (' + error.code + ').')
            } finally {
                if (active) setLoadCustomer(false)
            }
        }
        loadForm()
        return () => { active = false }
    }, [id, user.uid])

    const customer = customers.find(item => item.id === customerSelected)

    async function handleRegister(e) {
        e.preventDefault()
        if (loadCustomer || loadError || !customer || saving) return

        setSaving(true)
        const fields = { client: customer.companyName, clientId: customer.id, subject, description, status }
        try {
            if (id) {
                await updateDoc(doc(db, 'tickets', id), fields)
            } else {
                await addDoc(collection(db, 'tickets'), { ...fields, userId: user.uid, created_at: serverTimestamp() })
            }
            toast.success(id ? 'Ticket updated successfully' : 'Ticket registered successfully')
            navigate('/dashboard')
        } catch (error) {
            toast.error('Could not save the ticket (' + error.code + ').')
        } finally {
            setSaving(false)
        }
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
                        {loadError && <p role="alert">{loadError}</p>}
                        {!loadCustomer && !loadError && !customers.length && (
                            <p><Link to="/customers">Register a customer</Link> to use this form.</p>
                        )}
                        <label>Customer</label>
                        {
                            loadCustomer ? (
                                <input type="text" disabled={true} value="Carregando..." />
                            ) : (
                                <select disabled={!!loadError || !customers.length} value={customer ? customerSelected : ''} onChange={handleChangeCustomer}>
                                    {!customer && <option value="">Select one of your customers</option>}
                                    {customers.map(item => {
                                        return (
                                            <option key={item.id} value={item.id}>
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
                        <button type="submit" disabled={loadCustomer || !!loadError || !customer || saving}>Submit</button>
                    </form>
                </div>

            </div>
        </div>
    )
}