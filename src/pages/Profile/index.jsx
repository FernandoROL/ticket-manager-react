import { useContext, useState } from 'react'
import Header from '../../components/Header'
import Title from '../../components/Title'

import { FiSettings, FiUpload } from 'react-icons/fi'
import avatar from '../../assets/avatar.png'
import { AuthContext } from '../../contexts/auth'

import './style.css'
import { doc, updateDoc } from 'firebase/firestore'
import { db, storage } from '../../services/firebase'
import { toast } from 'react-toastify'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

export default function Profile() {

    const { user, storeUser, setUser, logout } = useContext(AuthContext)

    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl)
    const [imageAvatar, setImageAvatar] = useState(null)

    const [name, setName] = useState(user && user.username)
    const [email, setEmail] = useState(user && user.email)

    function handleFile(e) {
        if (e.target.files[0]) {
            const image = e.target.files[0]

            if (image.type === 'image/jpeg' || image.type === 'image/png') {
                setImageAvatar(image)
                setAvatarUrl(URL.createObjectURL(image))
            } else {
                alert("Profile picture only supports JPEG and PNG formats")
                setImageAvatar(null)
                return;
            }
        }
    }

    async function handleUpload() {
        const currentuid = user.uid;

        const uploadRef = ref(storage, `images/${currentuid}/${imageAvatar.name}`)

        const uploadTask = await uploadBytes(uploadRef, imageAvatar)
            .then((sanpshot) => {
                getDownloadURL(sanpshot.ref).then(async (downLoadUrl) => {
                    let urlPhoto = downLoadUrl

                    const docref = doc(db, 'users', user.uid)
                    await updateDoc(docref, {
                        avatarUrl: urlPhoto,
                        username: name
                    })
                        .then(() => {
                            let data = {
                                ...user,
                                username: name,
                                avatarUrl: urlPhoto
                            }

                            setUser(data)
                            storeUser(data)
                            toast.success("Updated successfully!")
                        })
                })
            })
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (imageAvatar === null && name != null) {
            const docRef = doc(db, 'users', user.uid)
            await updateDoc(docRef, {
                username: name
            })
                .then(() => {
                    let data = {
                        ...user,
                        username: name
                    }

                    setUser(data)
                    storeUser(data)
                    toast.success("Updated successfully!")
                })
        } else if (name !== '' && imageAvatar !== null) {
            handleUpload()
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
                    <form className='form-profile'>
                        <label className='label-avatar'>
                            <span>
                                <FiUpload color='#FFF' size={25} />
                            </span>

                            <input type="file" accept='image/*' onChange={handleFile} /> <br />
                            {avatarUrl === null ? (
                                <img src={avatar} alt='Profile picture' width={250} height={250} />
                            ) : (
                                <img src={avatarUrl} alt='Profile picture' width={250} height={250} />
                            )}
                        </label>

                        <label>Name</label>
                        <input type="text" placeholder='Your name' value={name} onChange={(e) => setName(e.target.value)} />

                        <label>Email</label>
                        <input type="text" placeholder='email@example.com' disabled value={email} />

                        <button type='submit' onClick={handleSubmit}>Submit</button>
                    </form>
                </div>

                <div className='container'>
                    <button className='logout-btn' onClick={logout}>Logout</button>
                </div>
            </div>
        </div>
    )
}