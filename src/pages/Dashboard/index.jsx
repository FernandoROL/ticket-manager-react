import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../contexts/auth'

import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiPlus, FiMessageSquare, FiSearch, FiEdit2 } from 'react-icons/fi'

import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, limit, startAfter, query, where } from 'firebase/firestore'

import { format } from 'date-fns'

import './dash.css'
import { db } from '../../services/firebase'
import Modal from '../../components/Modal'

const listRef = collection(db, "tickets")

async function fetchPage(uid, cursor) {
    const constraints = [where('userId', '==', uid), orderBy('created_at', 'desc')]
    if (cursor) constraints.push(startAfter(cursor))
    const snapshot = await getDocs(query(listRef, ...constraints, limit(5)))
    const tickets = snapshot.docs.map(document => {
        const data = document.data()
        return {
            ...data,
            id: document.id,
            customer: data.client,
            createdFormat: format(data.created_at.toDate(), 'dd/MM/yyyy')
        }
    })
    return { tickets, last: snapshot.docs.at(-1) }
}

export default function Dashboard() {
    const { user } = useContext(AuthContext);

    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true);

    const [hasMore, setHasMore] = useState(false)
    const [lastDocs, setLastDocs] = useState()
    const [loadingMore, setLoadingMore] = useState(false)

    const [showPostModal, setShowPostModal] = useState(false)
    const [detail, setDetail] = useState({})

    const [loadError, setLoadError] = useState('')

    useEffect(() => {
        let active = true
        async function loadTickets() {
            try {
                const page = await fetchPage(user.uid)
                if (active) {
                    setTickets(page.tickets)
                    setLastDocs(page.last)
                    setHasMore(page.tickets.length === 5)
                }
            } catch (error) {
                if (active) setLoadError('Could not load tickets (' + error.code + ').')
            } finally {
                if (active) setLoading(false)
            }
        }
        loadTickets()
        return () => { active = false }
    }, [user.uid])

    async function handleMore() {
        setLoadingMore(true)
        setLoadError('')
        try {
            const page = await fetchPage(user.uid, lastDocs)
            setTickets(current => [...current, ...page.tickets])
            setLastDocs(page.last)
            setHasMore(page.tickets.length === 5)
        } catch (error) {
            setLoadError('Could not load more tickets (' + error.code + ').')
        } finally {
            setLoadingMore(false)
        }
    }

    function toggleModal(item) {
        setShowPostModal(!showPostModal)
        setDetail(item)
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
                    {loadError && <p role="alert">{loadError}</p>}
                    {tickets.length === 0 ? (
                        <div className="container dashboard">
                            {!loadError && <span>Nenhum ticket encontrado...</span>}
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
                                    {tickets.map(item => {
                                        return (
                                            <tr key={item.id}>
                                                <td data-label="Customer">{item.customer}</td>
                                                <td data-label="Subject">{item.subject}</td>
                                                <td data-label="Status">
                                                    <span className="badge" style={{ backgroundColor: item.status === 'Open' ? '#5cb85c' : '#999' }}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td data-label="Registered">{item.createdFormat}</td>
                                                <td data-label="#">
                                                    <Link className="action" style={{ backgroundColor: '#3583f6' }} onClick={() => toggleModal(item)}>
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
                            {!loadingMore && hasMore && <button className='btn-more' onClick={handleMore}>Load more...</button>}
                        </>
                    )}
                </>

            </div>

            {showPostModal && (
                <Modal
                    content={detail}
                    close={ () => setShowPostModal(!showPostModal)}
                />
            )}

        </div>
    )
}