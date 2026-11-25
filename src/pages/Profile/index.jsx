import { useContext, useState } from 'react'
import Header from '../../components/Header'
import Title from '../../components/Title'

import { FiSettings, FiUpload } from 'react-icons/fi'
import avatar from '../../assets/avatar.png'
import { AuthContext } from '../../contexts/auth'

import './style.css'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { toast } from 'react-toastify'
import { prepareAvatar } from '../../services/avatar'

export default function Profile() {

    const { user, logout } = useContext(AuthContext)

    const [newAvatar, setNewAvatar] = useState(null)
    const [name, setName] = useState(user.username ?? '')
    const [preparing, setPreparing] = useState(false)
    const [saving, setSaving] = useState(false)

    async function handleFile(event) {
        const file = event.target.files[0]
        if (!file) return

        event.target.value = ''
        setPreparing(true)
        try {
            setNewAvatar(await prepareAvatar(file))
        } catch (error) {
            setNewAvatar(null)
            toast.error(error.name === 'EncodingError' ? 'This image cannot be opened.' : error.message)
        } finally {
            setPreparing(false)
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()
        if (preparing || saving || !name.trim()) return

        setSaving(true)
        const changes = { username: name.trim() }
        if (newAvatar) changes.avatarUrl = newAvatar

        try {
            await setDoc(doc(db, 'users', user.uid), changes, { merge: true })
            setNewAvatar(null)
            toast.success('Profile updated successfully!')
        } catch (error) {
            toast.error('Could not save the profile: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <Header />

            <div className="content">
                <Title name="My account">
                    <FiSettings size={25} />
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleSubmit}>
                        <label className='label-avatar'>
                            <span>
                                <FiUpload color='#FFF' size={25} />
                            </span>

                            <input type="file" accept="image/jpeg,image/png" disabled={preparing || saving} onChange={handleFile} />
                            <img src={newAvatar || user.avatarUrl || avatar} onError={event => {
                                if (event.currentTarget.getAttribute('src') !== avatar) event.currentTarget.src = avatar
                            }} alt="Profile picture" width={250} height={250} />
                        </label>

                        <label>Name</label>
                        <input type="text" placeholder='Your name' value={name} disabled={saving} onChange={(e) => setName(e.target.value)} />

                        <label>Email</label>
                        <input type="text" placeholder='email@example.com' disabled value={user.email} />

                        <button type='submit' disabled={preparing || saving || !name.trim()}>{saving ? 'Saving...' : 'Submit'}</button>
                    </form>
                </div>

                <div className='container'>
                    <button className='logout-btn' onClick={logout}>Logout</button>
                </div>
            </div>
        </div>
    )
}