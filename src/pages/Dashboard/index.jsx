import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../contexts/auth'

import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiPlus, FiMessageSquare, FiSearch, FiEdit2 } from 'react-icons/fi'

import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, limit, startAfter, query } from 'firebase/firestore'

import { format } from 'date-fns'

import './dash.css'
import { db } from '../../services/firebase'

const listRef = collection(db, "tickets")

export default function Dashboard() {
    const { logout } = useContext(AuthContext);

    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true);

    const [isEmpty, setIsEmpty] = useState(false)
    const [lastDocs, setLastDocs] = useState()
    const [loadingMore, setLoadingMore] = useState(false)

    useEffect(() => {
        async function loadTickets() {
            const q = query(listRef, orderBy('created_at', 'desc'), limit(5));

            const querySnapshot = await getDocs(q)
            setTickets([]);

            await updateState(querySnapshot)

            setLoading(false);

        }

        loadTickets();


        return () => { }
    }, [])


    async function updateState(querySnapshot) {
        const isCollectionEmpty = querySnapshot.size === 0;

        if (!isCollectionEmpty) {
            let lista = [];

            querySnapshot.forEach((doc) => {
                lista.push({
                    id: doc.id,
                    subject: doc.data().subject,
                    customer: doc.data().client,
                    clientId: doc.data().clientId,
                    created_at: doc.data().created_at,
                    createdFormat: format(doc.data().created_at.toDate(), 'dd/MM/yyyy'),
                    status: doc.data().status,
                    description: doc.data().description,
                })
            })

            setTickets(tickets => [...tickets, ...lista])

            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
            setLastDocs(lastDoc)

        } else {
            setIsEmpty(true);
        }

        setLoadingMore(false)

    }

    async function handleMore(){
        setLoadingMore(true)

        const q = query(listRef, orderBy('created_at', 'desc'), startAfter(lastDocs), limit(5))

        const querySnapshot = await getDocs(q)
        await updateState(querySnapshot)
    }


    if (loading) {
        return (
            <div>
                <Header />

                <div className="content">
                    <Title name="Tickets">
                        <FiMessageSquare size={25} />
                    </Title>

                    <div className="container dashboard">
                        <span>Loading tickets...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Header />

            <div className="content">
                <Title name="Tickets">
                    <FiMessageSquare size={25} />
                </Title>

                <>
                    {tickets.length === 0 ? (
                        <div className="container dashboard">
                            <span>Nenhum ticket encontrado...</span>
                            <Link to="/new" className="new">
                                <FiPlus color="#FFF" size={25} />
                                Novo ticket
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link to="/new" className="new">
                                <FiPlus color="#FFF" size={25} />
                                Novo ticket
                            </Link>

                            <table>
                                <thead>
                                    <tr>
                                        <th scope="col">Client</th>
                                        <th scope="col">Subject</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Registered on</th>
                                        <th scope="col">#</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td data-label="Customer">{item.customer}</td>
                                                <td data-label="Subject">{item.subject}</td>
                                                <td data-label="Status">
                                                    <span className="badge" style={{ backgroundColor: item.status === 'Open' ? '#5cb85c' : '#999' }}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td data-label="Registered">{item.createdFormat}</td>
                                                <td data-label="#">
                                                    <Link className="action" style={{ backgroundColor: '#3583f6' }}>
                                                        <FiSearch color='#FFF' size={17} />
                                                    </Link>
                                                    <Link to={`/edit/${item.id}`} className="action" style={{ backgroundColor: '#f6a935' }}>
                                                        <FiEdit2 color='#FFF' size={17} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {loadingMore && <h3>Loading more tickets...</h3>}
                            {!loadingMore && !isEmpty && <button className='btn-more' onClick={handleMore}>Load more...</button>}
                        </>
                    )}
                </>

            </div>

        </div>
    )
}