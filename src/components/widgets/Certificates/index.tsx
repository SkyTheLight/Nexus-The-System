'use client'

import { useState, useEffect } from 'react'
import { Award, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react'
import { getCertificates, createCertificate, deleteCertificate, updateCertificate, getSB } from '@/lib/api'
import { addLog } from '@/lib/logs'
import type { Certificate } from '@/types'
import { CreateCertificateModal } from '@/components/Modal'
import { addXpGlobal } from '@/hooks/useXp'

export default function CertificatesWidget() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<'to-get' | 'i-have'>('to-get')

  useEffect(() => { 
    loadCerts() 
    
    // Poll every 3 seconds to catch AI-created items
    const interval = setInterval(() => {
      loadCerts()
    }, 3000)
    
    return () => { clearInterval(interval) }
  }, [])

  async function loadCerts() {
    try {
      const data = await getCertificates()
      setCerts(data.slice(0, 5))
    } catch { } finally { setLoading(false) }
  }

  async function removeCert(id: string) {
    try {
      const cert = certs.find(c => c.id === id)
      if (cert) {
        await addLog({ original_id: id, type: 'certificate', title: cert.title, description: cert.provider, data: cert })
      }
      await deleteCertificate(id)
      loadCerts()
    } catch { }
  }

  async function moveToHave(id: string) {
    try {
      const cert = certs.find(c => c.id === id)
      if (cert && cert.status !== 'completed') {
        addXpGlobal(40) // +40 XP for completing a certificate
      }
      await updateCertificate(id, { status: 'completed' })
      loadCerts()
    } catch { }
  }

  async function moveToGet(id: string) {
    try {
      await updateCertificate(id, { status: 'not started' })
      loadCerts()
    } catch { }
  }

  async function handleCreate(cert: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createCertificate(cert)
      loadCerts()
    } catch { }
  }

  const toGet = certs.filter(c => c.status !== 'completed')
  const iHave = certs.filter(c => c.status === 'completed')

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Certificates</h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 hover:bg-accent rounded"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setActiveSection('to-get')}
            className={`flex-1 py-1.5 text-xs rounded-lg transition-all ${
              activeSection === 'to-get'
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                : 'bg-transparent border border-white/10 text-muted-foreground hover:border-white/20'
            }`}
          >
            TO GET ({toGet.length})
          </button>
          <button
            onClick={() => setActiveSection('i-have')}
            className={`flex-1 py-1.5 text-xs rounded-lg transition-all ${
              activeSection === 'i-have'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-transparent border border-white/10 text-muted-foreground hover:border-white/20'
            }`}
          >
            I HAVE ({iHave.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {(activeSection === 'to-get' ? toGet : iHave).map(cert => (
            <div key={cert.id} className="group flex items-center justify-between p-2 hover:bg-accent rounded">
              <span className="text-xs flex-1">{cert.title}</span>
              <div className="flex items-center gap-1">
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  cert.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {cert.status}
                </span>
                {activeSection === 'to-get' ? (
                  <button
                    onClick={() => moveToHave(cert.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-green-500/20 rounded"
                    title="Move to I HAVE"
                  >
                    <ArrowRight size={12} className="text-green-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => moveToGet(cert.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-yellow-500/20 rounded"
                    title="Move to TO GET"
                  >
                    <ArrowLeft size={12} className="text-yellow-400" />
                  </button>
                )}
                <button
                  onClick={() => removeCert(cert.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded"
                >
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
          {(activeSection === 'to-get' ? toGet : iHave).length === 0 && (
            <div className="text-xs text-muted-foreground">No certificates in this section</div>
          )}
        </div>
      </div>
      <CreateCertificateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
