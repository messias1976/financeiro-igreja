-- Seed data for onboarding/demo purposes
insert into churches (name, denomination, currency)
values ('Igreja Nova Aliança', 'Evangélica', 'BRL');

insert into users (church_id, name, email, password_hash, role)
select id, 'Maria Santos', 'admin@novaalanca.com', crypt('senha-super-segura', gen_salt('bf')), 'admin'
from churches
limit 1;

insert into members (church_id, name, phone, email, ministry)
select id, 'Pastor Rafael', '+55 11 99999-0000', 'rafael@novaalanca.com', 'Pastores'
from churches
limit 1;

insert into members (church_id, name, phone, email, ministry)
select id, 'Equipe de Louvor', '+55 11 98888-0000', 'louvor@novaalanca.com', 'Louvor'
from churches
limit 1;

insert into campaigns (church_id, name, goal_amount, description)
select id, 'Reforma do Templo', 50000, 'Reforma do salão principal e modernização das instalações.'
from churches
limit 1;

-- Example contributions
insert into transactions (church_id, member_id, type, amount, payment_method, description)
select c.id, m.id, 'dizimo', 200, 'pix', 'Dízimo mensal'
from churches c
join members m on m.church_id = c.id
where m.name = 'Pastor Rafael';

insert into transactions (church_id, type, amount, payment_method, description)
select id, 'oferta', 120, 'dinheiro', 'Oferta especial de missões'
from churches
limit 1;
