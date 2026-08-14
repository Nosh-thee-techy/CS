import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CtaDock } from "../components/CtaDock.jsx";
import PillButton from "../components/PillButton.jsx";
import { summarizeLoan } from "../lib/loanBalance.js";
import { useReadiness } from "../context/ReadinessContext.jsx";

const PURPOSES = ["input_purchase", "farm_equipment", "other"];
const APPLY_STEPS = ["eligible", "amount", "purpose", "confirm"];

function formatKes(amount) {
  return `KES ${Number(amount || 0).toLocaleString("en-KE")}`;
}

export default function LoanScreen() {
  const { t } = useTranslation();
  const { profile, repayLoan } = useReadiness();

  if (!profile) return null;

  const payments = profile.payments || [];
  const loan = summarizeLoan(payments);
  const hasDebt = loan.outstanding > 0;
  const [pane, setPane] = useState(hasDebt ? "repay" : "apply");

  return (
    <div className="space-y-4">
      {hasDebt && (
        <div className="grid grid-cols-2 gap-2 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
          <PaneTab active={pane === "apply"} onClick={() => setPane("apply")} label={t("loan.paneApply")} />
          <PaneTab active={pane === "repay"} onClick={() => setPane("repay")} label={t("loan.paneRepay")} />
        </div>
      )}

      {pane === "repay" && hasDebt ? (
        <RepaySection loan={loan} onRepay={repayLoan} />
      ) : (
        <ApplyFlow profile={profile} hasDebt={hasDebt} />
      )}

      <DeductionList deductions={profile.deductions} />
      <HarvestPayout />
      <PaymentList payments={payments} />
    </div>
  );
}

function PaneTab({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-full text-sm font-semibold ${
        active ? "bg-white text-black" : "text-white/60"
      }`}
    >
      {label}
    </button>
  );
}

function ApplyFlow({ profile, hasDebt }) {
  const { t } = useTranslation();
  const pending = profile.loanApplication?.status === "pending";
  const eligible = Boolean(profile.disbursementEligible) && Number(profile.eligibleAmount) > 0;

  if (pending) {
    return (
      <div className="space-y-4">
        <h1 className="text-[28px] font-bold tracking-tight text-white">{t("loan.pendingTitle")}</h1>
        <section className="rounded-[24px] border border-ember/40 bg-ember/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ember-glow">{t("loan.reference")}</p>
          <p className="mt-2 text-[16px] leading-relaxed text-white">
            {t("loan.pendingBody", {
              amount: Number(profile.loanApplication.requestedAmount || profile.loanApplication.amount).toLocaleString(
                "en-KE",
              ),
            })}
          </p>
          <p className="mt-3 text-sm text-mute">{profile.loanApplication.reference}</p>
        </section>
        <HowItWorks />
      </div>
    );
  }

  return <ApplyWizard profile={profile} eligible={eligible} hasDebt={hasDebt} />;
}

function ApplyWizard({ profile, eligible, hasDebt }) {
  const { t } = useTranslation();
  const { applyForLoan, loanBusy, loanError } = useReadiness();
  const max = Number(profile.eligibleAmount) || 0;
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState("input_purchase");

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">
          {t("loan.stepOf", { n: step + 1, total: APPLY_STEPS.length })}
        </p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight text-white">{t("loan.title")}</h1>
      </header>

      <StepDots total={APPLY_STEPS.length} current={step} />

      {step === 0 && (
        <div className="space-y-4">
          <section className="rounded-[24px] border border-white/15 bg-panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{t("loan.eligibleAmount")}</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white">{formatKes(max)}</p>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              {eligible ? t("loan.eligibleHint") : hasDebt ? t("loan.payFirst") : profile.nextTierHint}
            </p>
            {eligible && hasDebt && (
              <p className="mt-2 text-sm leading-relaxed text-ember-glow">{t("loan.payFirst")}</p>
            )}
          </section>
          {!eligible && (
            <p className="rounded-[20px] border border-white/15 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white">
              {hasDebt ? t("loan.payFirst") : t("loan.lockedBody")}
            </p>
          )}
          <HowItWorks />
          <CtaDock>
            <PillButton type="button" variant="ember" disabled={!eligible} onClick={() => setStep(1)}>
              {eligible && max
                ? t("score.applyCta", { amount: max.toLocaleString("en-KE") })
                : t("loan.apply")}
            </PillButton>
          </CtaDock>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <section className="rounded-[24px] border border-ember/40 bg-ember/15 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ember-glow">{t("loan.youQualify")}</p>
            <p className="mt-1 text-3xl font-bold text-white">{formatKes(max)}</p>
            <p className="mt-2 text-sm text-white/80">{t("loan.capNote")}</p>
          </section>

          <p className="text-[16px] font-semibold text-white">{t("loan.amount")}</p>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-mute">{t("loan.eligibleAmount")}</span>
            <input
              readOnly
              value={formatKes(max)}
              className="h-14 w-full rounded-full border border-white/20 bg-white/5 px-5 text-[16px] text-white outline-none"
            />
          </label>
          <p className="text-sm leading-relaxed text-mute">{t("loan.capNote")}</p>

          <CtaDock>
            <div className="flex gap-2">
              <BackButton onClick={() => setStep(0)} />
              <div className="min-w-0 flex-1">
                <PillButton type="button" variant="ember" disabled={!max} onClick={() => setStep(2)}>
                  {t("loan.next")}
                </PillButton>
              </div>
            </div>
          </CtaDock>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-[16px] font-semibold text-white">{t("loan.purposeAsk")}</p>
          <div className="space-y-2">
            {PURPOSES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPurpose(id)}
                className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left ${
                  purpose === id ? "border-ember bg-ember/20" : "border-white/15 bg-panel"
                }`}
              >
                <span className="text-[16px] font-semibold text-white">{t(`loan.purposes.${id}`)}</span>
                <span className={`h-4 w-4 rounded-full ring-2 ${purpose === id ? "bg-ember ring-ember" : "ring-white/30"}`} />
              </button>
            ))}
          </div>
          <CtaDock>
            <div className="flex gap-2">
              <BackButton onClick={() => setStep(1)} />
              <div className="min-w-0 flex-1">
                <PillButton type="button" variant="ember" onClick={() => setStep(3)}>
                  {t("loan.next")}
                </PillButton>
              </div>
            </div>
          </CtaDock>
        </div>
      )}

      {step === 3 && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            applyForLoan(purpose, "", max);
          }}
        >
          <section className="rounded-[24px] border border-white/15 bg-panel p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">{t("loan.confirmTitle")}</h2>
            <Row label={t("loan.youQualify")} value={formatKes(max)} />
            <Row label={t("loan.confirmAmount")} value={formatKes(max)} />
            <Row label={t("loan.purpose")} value={t(`loan.purposes.${purpose}`)} />
          </section>

          <p className="text-sm leading-relaxed text-mute">{t("loan.submitHelp")}</p>

          {loanError && (
            <p className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white">{loanError}</p>
          )}

          <CtaDock>
            <div className="flex gap-2">
              <BackButton onClick={() => setStep(2)} />
              <div className="min-w-0 flex-1">
                <PillButton
                  type="button"
                  variant="ember"
                  disabled={loanBusy || !max}
                  onClick={() => applyForLoan(purpose, "", max)}
                >
                  {loanBusy ? t("loan.submitting") : t("loan.submit")}
                </PillButton>
              </div>
            </div>
          </CtaDock>
        </form>
      )}
    </div>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  const steps = [t("loan.guide.1"), t("loan.guide.2"), t("loan.guide.3"), t("loan.guide.4")];
  return (
    <section className="rounded-[24px] border border-white/15 bg-panel p-4">
      <h2 className="text-sm font-semibold text-white">{t("loan.guideTitle")}</h2>
      <ol className="mt-3 space-y-3">
        {steps.map((text, index) => (
          <li key={text} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ember text-xs font-bold text-white">
              {index + 1}
            </span>
            <p className="pt-0.5 text-[15px] leading-relaxed text-white/90">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepDots({ total, current }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 flex-1 rounded-full ${index <= current ? "bg-ember" : "bg-white/15"}`}
        />
      ))}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm text-mute">{label}</p>
      <p className="text-right text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function BackButton({ onClick }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-14 shrink-0 rounded-full border border-white/20 px-5 text-sm font-semibold text-white"
    >
      {t("loan.back")}
    </button>
  );
}

function RepaySection({ loan, onRepay }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState("installment");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const amount = mode === "full" ? loan.outstanding : loan.installment;
  const remaining = Math.max(0, loan.outstanding - amount);

  async function onSubmit(event) {
    event.preventDefault();
    if (!amount || busy) return;
    setBusy(true);
    setError("");
    try {
      await onRepay(amount);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("repay.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <h1 className="text-[28px] font-bold tracking-tight text-white">{t("repay.title")}</h1>

      <section className="rounded-[24px] border border-white/15 bg-panel p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{t("repay.outstanding")}</p>
        <p className="mt-2 text-4xl font-bold tracking-tight text-white">{formatKes(loan.outstanding)}</p>
        <p className="mt-2 text-sm text-mute">{t("repay.due")}</p>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <ModeChip
          active={mode === "installment"}
          onClick={() => setMode("installment")}
          label={t("repay.payInstallment")}
          amount={formatKes(loan.installment)}
        />
        <ModeChip
          active={mode === "full"}
          onClick={() => setMode("full")}
          label={t("repay.payFull")}
          amount={formatKes(loan.outstanding)}
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-mute">{t("repay.thisPayment")}</span>
        <input
          readOnly
          value={formatKes(amount)}
          className="h-14 w-full rounded-full border border-white/20 bg-white/5 px-5 text-[16px] text-white outline-none"
        />
      </label>

      <p className="text-sm leading-relaxed text-mute">
        {remaining > 0 ? t("repay.remaining", { amount: remaining.toLocaleString("en-KE") }) : t("repay.clears")}
      </p>
      <p className="text-sm leading-relaxed text-mute">{t("repay.method")}</p>

      {done && (
        <p className="rounded-2xl border border-ember/40 bg-ember/15 px-3 py-2 text-sm font-medium text-ember-glow">
          {t("repay.success")}
        </p>
      )}
      {error && (
        <p className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white">{error}</p>
      )}

      <CtaDock>
        <PillButton type="button" variant="ember" disabled={busy || !amount} onClick={onSubmit}>
          {busy ? t("repay.sending") : t("repay.submit")}
        </PillButton>
      </CtaDock>
    </form>
  );
}

function ModeChip({ active, onClick, label, amount }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] border px-3 py-3 text-left ${
        active ? "border-ember bg-ember/20" : "border-white/15 bg-panel"
      }`}
    >
      <span className="block text-xs font-semibold text-mute">{label}</span>
      <span className="mt-1 block text-[15px] font-semibold text-white">{amount}</span>
    </button>
  );
}

function HarvestPayout() {
  const { t } = useTranslation();
  const { requestHarvestPayout, payoutBusy, payoutError, payoutNotice, profile } = useReadiness();
  if (!profile?.farmerId) return null;

  return (
    <section className="rounded-[24px] border border-white/15 bg-panel p-4 space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{t("payout.title")}</h2>
      <p className="text-sm leading-relaxed text-mute">{t("payout.help")}</p>
      {payoutNotice && (
        <p className="rounded-2xl border border-ember/40 bg-ember/15 px-3 py-2 text-sm font-medium text-ember-glow">
          {t("payout.success", { id: payoutNotice })}
        </p>
      )}
      {payoutError && (
        <p className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white">{payoutError}</p>
      )}
      <PillButton type="button" variant="ember" disabled={payoutBusy} onClick={() => requestHarvestPayout()}>
        {payoutBusy ? t("payout.sending") : t("payout.submit")}
      </PillButton>
    </section>
  );
}

function DeductionList({ deductions }) {
  const { t } = useTranslation();
  const rows = deductions || [];
  const taken = rows.reduce((sum, row) => sum + (Number(row.deducted) || 0), 0);

  return (
    <section className="rounded-[24px] border border-white/15 bg-panel p-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{t("loan.deductionsTitle")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-mute">{t("loan.deductionsHelp")}</p>

      {rows.length === 0 ? (
        <p className="mt-3 text-[15px] text-white">{t("loan.noDeductions")}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-[20px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{t(`loan.deductionReasons.${row.reason}`)}</p>
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                  {t(`payments.status.${row.rawStatus}`, { defaultValue: row.status })}
                </span>
              </div>
              <dl className="mt-2 space-y-1">
                <Row label={t("loan.harvestGross")} value={formatKes(row.gross)} />
                <Row label={t("loan.loanDeduction")} value={formatKes(row.deducted)} />
                <Row label={t("loan.youReceived")} value={formatKes(row.net)} />
              </dl>
            </li>
          ))}
        </ul>
      )}

      {taken > 0 && (
        <p className="mt-3 text-sm font-semibold text-ember-glow">
          {t("loan.deductionTotal", { amount: taken.toLocaleString("en-KE") })}
        </p>
      )}
    </section>
  );
}

function PaymentList({ payments }) {
  const { t } = useTranslation();
  if (!payments?.length) return null;
  return (
    <section className="rounded-[24px] border border-white/15 bg-panel p-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{t("payments.title")}</h2>
      <ul className="mt-3 space-y-3">
        {payments.map((payment) => (
          <li key={payment.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {t(`payments.kinds.${payment.kind}`, { defaultValue: payment.kindLabel })}
              </p>
              <p className="text-sm text-mute">{formatKes(payment.amount)}</p>
            </div>
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-semibold text-white">
              {t(`payments.status.${payment.rawStatus}`, { defaultValue: payment.status })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
