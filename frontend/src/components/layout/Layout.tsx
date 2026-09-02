import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import CartPanel from '../CartPanel'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
      <CartPanel />
    </div>
  )
}
