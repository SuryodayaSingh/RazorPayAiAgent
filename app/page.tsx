
"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CreditCard,
  Database,
  Mail,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Webhook,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900">
      
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
    
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
              <Zap className="h-5 w-5" />
            </div>

            <span className="text-lg font-bold tracking-tight">
              Recover<span className="text-gray-500">AI</span>
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              How it works
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              Features
            </a>

            <a
              href="#architecture"
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              Architecture
            </a>

            <button
              onClick={goToDashboard}
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Open Dashboard
            </button>
          </div>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-lg p-2 md:hidden"
          >
            {mobileMenu ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-gray-200 bg-white px-6 py-5 md:hidden">
            <div className="flex flex-col gap-4">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenu(false)}
                className="text-sm font-medium text-gray-700"
              >
                How it works
              </a>

              <a
                href="#features"
                onClick={() => setMobileMenu(false)}
                className="text-sm font-medium text-gray-700"
              >
                Features
              </a>

              <a
                href="#architecture"
                onClick={() => setMobileMenu(false)}
                className="text-sm font-medium text-gray-700"
              >
                Architecture
              </a>

              <button
                onClick={goToDashboard}
                className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                Open Dashboard
              </button>
            </div>
          </div>
        )}
      </nav>

    
      <section className="relative overflow-hidden pt-32">

        <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gray-200/50 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
          <div className="mx-auto max-w-4xl text-center">
          
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">
              <Sparkles className="h-4 w-4" />
              AI-Powered Revenue Recovery
            </div>

         
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Turn failed payments
              <br />
              into{" "}
              <span className="bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400 bg-clip-text text-transparent">
                recovered revenue.
              </span>
            </h1>

          
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
              RecoverAI analyzes failed payments using AI, predicts recovery
              probability, and automatically chooses the best recovery action
              for every customer.
            </p>

           
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={goToDashboard}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-black px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 sm:w-auto"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>

              <a
                href="#how-it-works"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 sm:w-auto"
              >
                See how it works
              </a>
            </div>

        
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Automated recovery
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                AI-powered decisions
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Real-time dashboard
              </span>
            </div>
          </div>

          <div className="relative mx-auto mt-20 max-w-6xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl shadow-gray-300/40">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                <div className="mb-5 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                  <div className="h-3 w-3 rounded-full bg-gray-300" />

                  <div className="ml-4 h-7 flex-1 rounded-lg bg-white" />
                </div>


                <div className="grid gap-4 md:grid-cols-4">
                  <DashboardStat
                    title="Total Payments"
                    value="1,248"
                    icon={<CreditCard className="h-4 w-4" />}
                  />

                  <DashboardStat
                    title="Failed Payments"
                    value="186"
                    icon={<TrendingUp className="h-4 w-4" />}
                  />

                  <DashboardStat
                    title="Recovery Rate"
                    value="72.4%"
                    icon={<BrainCircuit className="h-4 w-4" />}
                  />

                  <DashboardStat
                    title="Revenue at Risk"
                    value="₹84.2K"
                    icon={<Zap className="h-4 w-4" />}
                  />
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="h-52 rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          Recovery Performance
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          AI-driven recovery over time
                        </p>
                      </div>

                      <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="flex h-28 items-end gap-3">
                      {[35, 48, 42, 62, 58, 78, 72, 90, 82, 96].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-md bg-gray-900"
                            style={{ height: `${height}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm font-semibold">
                      AI Recovery Actions
                    </p>

                    <div className="mt-5 space-y-4">
                      <RecoveryItem
                        label="Alternate Payment"
                        value="42%"
                      />

                      <RecoveryItem
                        label="Payment Retry"
                        value="31%"
                      />

                      <RecoveryItem
                        label="Email Reminder"
                        value="18%"
                      />

                      <RecoveryItem
                        label="Support"
                        value="9%"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

         
            <div className="absolute -bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-xl sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
                <BrainCircuit className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  AI Recommendation
                </p>
                <p className="text-sm font-semibold">
                  Try alternate payment method
                </p>
              </div>

              <CheckCircle2 className="ml-2 h-5 w-5 text-gray-700" />
            </div>
          </div>
        </div>
      </section>


      <section className="border-y border-gray-200 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              The Problem
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Failed payments don't have to mean lost revenue.
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              Traditional payment systems tell you that a transaction failed.
              RecoverAI goes one step further — it determines{" "}
              <span className="font-semibold text-gray-900">
                why it failed, how likely it is to recover,
              </span>{" "}
              and what action should happen next.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <ProblemCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Payment Failed"
              description="A customer payment is declined, interrupted, or fails during authorization."
            />

            <ProblemCard
              icon={<BrainCircuit className="h-6 w-6" />}
              title="AI Understands Why"
              description="Gemini analyzes payment context and estimates the probability of successful recovery."
            />

            <ProblemCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Revenue Recovered"
              description="The system automatically selects and executes an appropriate recovery action."
            />
          </div>
        </div>
      </section>


      <section id="how-it-works" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              How it works
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              From failed payment to recovery automatically.
            </h2>

            <p className="mt-5 text-lg text-gray-600">
              A complete AI-powered pipeline designed to reduce revenue lost
              to failed transactions.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <StepCard
              number="01"
              icon={<Webhook className="h-6 w-6" />}
              title="Payment Event"
              description="Razorpay sends payment events through secure webhooks."
            />

            <StepCard
              number="02"
              icon={<Database className="h-6 w-6" />}
              title="Store & Analyze"
              description="Payment information and failure context are stored in MongoDB."
            />

            <StepCard
              number="03"
              icon={<BrainCircuit className="h-6 w-6" />}
              title="AI Decision"
              description="Gemini evaluates risk, recovery probability, and the best action."
            />

            <StepCard
              number="04"
              icon={<Mail className="h-6 w-6" />}
              title="Recover Revenue"
              description="The recovery engine executes actions such as retry or customer email."
            />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-20 border-y border-gray-200 bg-white py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Features
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              An intelligent recovery layer for payments.
            </h2>

            <p className="mt-5 text-lg text-gray-600">
              Everything needed to monitor, understand, and recover failed
              payments.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BrainCircuit />}
              title="AI Payment Analysis"
              description="Analyze payment failures and generate structured AI reasoning with risk and recovery probability."
            />

            <FeatureCard
              icon={<Zap />}
              title="Smart Recovery Actions"
              description="Automatically select actions such as retry, alternate payment, support, or reminder."
            />

            <FeatureCard
              icon={<Mail />}
              title="Automated Customer Email"
              description="Send contextual recovery emails when an alternate payment or support action is recommended."
            />

            <FeatureCard
              icon={<TrendingUp />}
              title="Revenue at Risk"
              description="Understand how much revenue is currently exposed to failed transactions."
            />

            <FeatureCard
              icon={<ShieldCheck />}
              title="Risk Classification"
              description="Classify failed payments into low, medium, and high-risk categories."
            />

            <FeatureCard
              icon={<Database />}
              title="Centralized Analytics"
              description="Track payments, AI decisions, recovery actions, and outcomes from one dashboard."
            />
          </div>
        </div>
      </section>

  
      <section id="architecture" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Architecture
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Built as an intelligent payment recovery pipeline.
            </h2>

            <p className="mt-5 text-lg text-gray-600">
              Payment infrastructure stays reliable while AI handles the
              intelligence layer.
            </p>
          </div>

  
          <div className="mt-16 overflow-x-auto">
            <div className="mx-auto flex min-w-[900px] items-center justify-center gap-3">
              <ArchitectureBox
                icon={<CreditCard />}
                title="Razorpay"
                subtitle="Payment"
              />

              <Arrow />

              <ArchitectureBox
                icon={<Webhook />}
                title="Webhook"
                subtitle="Events"
              />

              <Arrow />

              <ArchitectureBox
                icon={<Database />}
                title="MongoDB"
                subtitle="Payment Data"
              />

              <Arrow />

              <ArchitectureBox
                icon={<BrainCircuit />}
                title="Gemini AI"
                subtitle="Analysis"
              />

              <Arrow />

              <ArchitectureBox
                icon={<Zap />}
                title="Recovery"
                subtitle="Action"
              />
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-3">
              <ArchitecturePoint
                title="Payment Layer"
                text="Razorpay handles payment processing and payment events."
              />

              <ArchitecturePoint
                title="Intelligence Layer"
                text="Gemini converts payment context into actionable recovery decisions."
              />

              <ArchitecturePoint
                title="Action Layer"
                text="Recovery Engine executes the recommended customer action."
              />
            </div>
          </div>
        </div>
      </section>

  
      <section className="border-y border-gray-200 bg-gray-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                <BrainCircuit className="h-4 w-4" />
                AI Decision Engine
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Don't just detect failures.
                <br />
                Decide what to do next.
              </h2>

              <p className="mt-6 text-lg leading-8 text-gray-400">
                Every failed payment is evaluated individually. RecoverAI
                considers payment context, failure reason, and customer
                signals before recommending the next best action.
              </p>

              <button
                onClick={goToDashboard}
                className="mt-8 flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                Explore AI Analysis
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

       
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-gray-400">AI Analysis</p>
                  <p className="mt-1 font-semibold">Payment Recovery</p>
                </div>

                <div className="rounded-lg bg-white/10 p-2">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-6 pt-6">
                <DarkMetric
                  label="Risk Level"
                  value="MEDIUM"
                />

                <DarkMetric
                  label="Recovery Probability"
                  value="78%"
                />

                <DarkMetric
                  label="Recommended Action"
                  value="ALTERNATE_PAYMENT"
                />

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    AI Reasoning
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    Payment authorization failed. Customer appears recoverable,
                    so suggesting an alternate payment method provides a high
                    probability of successful recovery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

  
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-black px-6 py-16 text-center text-white sm:px-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
                <Zap className="h-6 w-6" />
              </div>

              <h2 className="mt-7 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to recover more revenue?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
                Monitor failed payments, understand why they happen, and let
                AI determine the best recovery strategy.
              </p>

              <button
                onClick={goToDashboard}
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                Open Recovery Dashboard
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

   
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
              <Zap className="h-4 w-4" />
            </div>

            <span className="font-semibold">
              Recover<span className="text-gray-500">AI</span>
            </span>
          </div>

          <p className="text-sm text-gray-500">
            AI-powered revenue recovery for failed payments.
          </p>

          <button
            onClick={goToDashboard}
            className="text-sm font-semibold text-gray-900 hover:underline"
          >
            Dashboard →
          </button>
        </div>
      </footer>
    </main>
  );
}



function DashboardStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{title}</p>

        <div className="text-gray-400">{icon}</div>
      </div>

      <p className="mt-3 text-2xl font-bold">{value}</p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-3/4 rounded-full bg-gray-900" />
      </div>
    </div>
  );
}

function RecoveryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>

      <div className="h-1.5 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-900"
          style={{
            width: value,
          }}
        />
      </div>
    </div>
  );
}

function ProblemCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
          {icon}
        </div>

        <span className="text-sm font-bold text-gray-300">{number}</span>
      </div>

      <h3 className="mt-7 text-lg font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-gray-50 p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm transition group-hover:bg-black group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
    </div>
  );
}

function ArchitectureBox({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex w-36 flex-col items-center rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold">{title}</p>

      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function Arrow() {
  return (
    <ArrowRight className="h-5 w-5 shrink-0 text-gray-400" />
  );
}

function ArchitecturePoint({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
    </div>
  );
}

function DarkMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>

      <span className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}
