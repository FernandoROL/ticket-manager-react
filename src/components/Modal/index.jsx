import { FiX } from 'react-icons/fi'
import './style.css'

export default function Modal({ content, close }) {
    return (
        <div>
            <div className="modal">
                <div className="container">
                    <bitton className="close" onClick={close}>
                        <FiX size={25} color='white' />
                        Close
                    </bitton>

                    <main>
                        <h2>Ticket details</h2>

                        <div className="row">
                            <span>
                                Customer: <i>{content.customer}</i>
                            </span>
                        </div>

                        <div className="row">
                            <span>
                                Subject: <i>{content.subject}</i>
                            </span>
                            <span>
                                Registered in: <i>{content.createdFormat}</i>
                            </span>
                        </div>

                        <div className="row">
                            <span>
                                Status: <i>{content.status}</i>
                            </span>
                        </div>
                        
                        <>
                            <h3>Description</h3>
                            <p>{content.description}</p>
                        </>

                    </main>
                </div>
            </div>
        </div>
    )
}