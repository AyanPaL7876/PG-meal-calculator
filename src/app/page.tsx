"use client";
import LandingNav from "@/components/LandingPage/LandingNav";
import HeroSection from "@/components/LandingPage/HeroSection";
import Features from "@/components/LandingPage/Features";
import Work from "@/components/LandingPage/Work";
import CTA from "@/components/LandingPage/CTA";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-900">
      <LandingNav />
      <HeroSection />
      <Features />
      <Work />
      <CTA />
    </main>
  );
}