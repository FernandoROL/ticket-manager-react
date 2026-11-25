import assert from 'node:assert/strict'
import test from 'node:test'
import { randomUUID } from 'node:crypto'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import {
    getFirestore, connectFirestoreEmulator, doc, setDoc, getDocFromServer, updateDoc,
    collection, query, where, orderBy, getDocsFromServer, serverTimestamp
} from 'firebase/firestore'

async function account(t) {
    const id = randomUUID()
    const app = initializeApp({ projectId: 'demo-ticket', apiKey: 'demo-key' }, id)
    t.after(() => deleteApp(app))
    const auth = getAuth(app)
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    const db = getFirestore(app)
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    const { user } = await createUserWithEmailAndPassword(auth, id + '@example.test', 'demo-password')
    return { auth, db, uid: user.uid }
}

test('profiles, customers and tickets are isolated by account', async t => {
    const owner = await account(t)
    const other = await account(t)
    const denied = { code: 'permission-denied' }
    const profile = doc(owner.db, 'users', owner.uid)
    const customer = doc(collection(owner.db, 'customers'))
    const ticket = doc(collection(owner.db, 'tickets'))
    const data = { userId: owner.uid, clientId: customer.id, status: 'Open', created_at: serverTimestamp() }

    assert.equal((await getDocFromServer(profile)).exists(), false)
    await setDoc(profile, { username: 'Owner', avatarUrl: null })
    await setDoc(customer, { userId: owner.uid, companyName: 'Company' })
    await setDoc(ticket, data)
    await updateDoc(ticket, { status: 'Answered' })
    const ownTickets = db => query(collection(db, 'tickets'), where('userId', '==', owner.uid), orderBy('created_at', 'desc'))
    assert.equal((await getDocsFromServer(ownTickets(owner.db))).size, 1)

    for (const ref of [profile, customer, ticket]) {
        await assert.rejects(getDocFromServer(doc(other.db, ref.path)), denied)
    }
    await assert.rejects(getDocsFromServer(ownTickets(other.db)), denied)
    await assert.rejects(getDocsFromServer(collection(owner.db, 'tickets')), denied)
    await assert.rejects(updateDoc(doc(other.db, ticket.path), { status: 'Answered' }), denied)
    await assert.rejects(updateDoc(ticket, { userId: other.uid }), denied)
    await assert.rejects(setDoc(doc(collection(other.db, 'tickets')), { ...data, userId: other.uid }), denied)
    await assert.rejects(setDoc(doc(collection(other.db, 'customers')), { userId: owner.uid }), denied)
    await signOut(owner.auth)
    await assert.rejects(getDocFromServer(profile), denied)
})
