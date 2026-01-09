'use client'

import React from 'react'
import { HomeHero } from '@/features/home/components/HomeHero'
import { Header } from '@/shared/ui/Header'
import { FeaturedProperties } from '@/features/home/components/FeaturedProperties'
import { PropertySearch } from '@/features/home/components/PropertySearch'
import { Footer } from '@/shared/ui/Footer'
import { useAuthContext } from '@/features/auth/providers/AuthProvider'
function page () {
  return (
    <div className=''>
      <Header />
      <HomeHero />
      <HomePersonalizedSection />
      <PropertySearch />
      <FeaturedProperties />
      <Footer />
    </div>
  )
}

function HomePersonalizedSection () {
  const { status } = useAuthContext()

  if (status !== 'authenticated') return null;
  return (<>
    <div>
      This is improtant
    </div>
  </>)

}

export default page