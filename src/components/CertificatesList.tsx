'use client'

import { useState, useEffect } from 'react'
import { Award, Plus, Calendar } from 'lucide-react'
import { Certificate } from '@/types'
import { getCertificates, createCertificate } from '@/lib/api'
import { CreateCertificateModal } from '@/components/Modal'

export default function CertificatesList() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    loadCertificates()
  }, [])

  async function loadCertificates() {
    try {
      const data = await getCertificates()
      setCertificates(data)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(cert: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createCertificate(cert)
      loadCertificates()
    } catch (error) {
      console.error('Error creating certificate:', error)
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Certificates</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Add Certificate
          </button>
        </div>

        <div className="space-y-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-accent-foreground/20 transition-colors">
              <Award size={18} className="text-muted-foreground shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{cert.title}</h3>
                {cert.provider && <p className="text-xs text-gray-300">{cert.provider}</p>}
              </div>
              {cert.deadline && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} />
                  {cert.deadline}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded ${
                cert.status === 'studying' ? 'bg-yellow-500/10 text-yellow-500' :
                cert.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                'bg-accent text-muted-foreground'
              }`}>
                {cert.status}
              </span>
            </div>
          ))}
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
