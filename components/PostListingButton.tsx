'use client'
import { useState } from 'react'
import PostListingModal from './PostListingModal'

export default function PostListingButton({ label = '+ Post a Listing', className = 'btn btn-primary' }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <a className={className} onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>{label}</a>
      <PostListingModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
