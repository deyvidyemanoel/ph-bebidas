-- Permite registrar a quitação de vendas fiado: forma de pagamento usada
-- para pagar a dívida e o momento em que isso aconteceu, sem perder o
-- payment_method original ('fiado') para fins de histórico.
alter table vendas
  add column if not exists settled_payment_method text,
  add column if not exists paid_at timestamptz;
