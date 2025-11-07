"use client";

import { FormEvent, useState } from "react";

const SUBJECT_OPTIONS = [
  { value: "problema_pedido", label: "Problema com pedido" },
  { value: "duvida_pagamento", label: "Dúvida sobre pagamento" },
  { value: "problema_entrega", label: "Problema com entrega" },
  { value: "produto_defeito", label: "Produto com defeito" },
  { value: "outro", label: "Outro" },
];

export function ContactSupportForm({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName?: string | null;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Não foi possível enviar sua mensagem.");
      }

      setSuccess("Mensagem enviada com sucesso! Vamos responder em até 2 horas.");
      setSubject("");
      setMessage("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Ocorreu um erro inesperado. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || !subject || message.trim().length < 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="text-xs text-muted">
        <span className="font-medium text-gray-700">
          {userName ? `${userName} • ` : null}
        </span>
        <span>{userEmail}</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="support-subject">
          Assunto
        </label>
        <select
          id="support-subject"
          name="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-sm"
          disabled={loading}
          required
        >
          <option value="">Selecione o assunto</option>
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="support-message">
          Sua mensagem
        </label>
        <textarea
          id="support-message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg h-24 text-sm resize-none"
          placeholder="Descreva sua dúvida ou problema com detalhes..."
          disabled={loading}
          minLength={10}
          required
        />
        <p className="mt-1 text-xs text-muted">
          {message.length ? `${message.length} caracteres` : "Mínimo de 10 caracteres"}
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full bg-[#F8B075] hover:bg-[#F8B075]/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitDisabled}
      >
        {loading ? "Enviando..." : "Enviar Mensagem"}
      </button>
    </form>
  );
}

export default ContactSupportForm;

