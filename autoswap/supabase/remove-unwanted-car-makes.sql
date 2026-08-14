drop table if exists unwanted_car_makes;

create temporary table unwanted_car_makes (
  name text primary key
) on commit drop;

insert into unwanted_car_makes (name) values
  ('1955 CUSTOM BELAIR'),
  ('AAS'),
  ('AC PROPULSION'),
  ('ALLARD MOTOR WORKS'),
  ('AMERITECH CORPORATION'),
  ('ARMBRUSTER STAGEWAY'),
  ('AUTOCAR LTD'),
  ('AUTODELTA USA INC'),
  ('AUTOMOBILI PININFARINA'),
  ('AVANTI'),
  ('AVERA MOTORS'),
  ('BACKDRAFT'),
  ('BAKKURA MOBILITY'),
  ('BALLISTIC'),
  ('BBC'),
  ('BERTONE'),
  ('BLACKWATER'),
  ('BLUECAR'),
  ('BUG MOTORS'),
  ('BXR'),
  ('C-R CHEETAH RACE CARS'),
  ('CALMOTORS'),
  ('CAMELOT'),
  ('CARBODIES'),
  ('CHECKER'),
  ('CLASSIC ROADSTERS'),
  ('CLASSIC SPORTS CARS'),
  ('CLENET'),
  ('CLENET COACHWORKS'),
  ('COBRA CARS'),
  ('CODA'),
  ('CONSULIER GTP'),
  ('CONTEMPORARY CLASSIC CARS (CCC)'),
  ('COSTIN SPORTS CAR'),
  ('CREATIVE COACHWORKS'),
  ('CREATIVE COACHWORKS INC'),
  ('CRUISE'),
  ('CX AUTOMOTIVE'),
  ('CZINGER'),
  ('DAYTONA COACH BUILDERS'),
  ('ECOCAR'),
  ('ELECTRIC CAR COMPANY'),
  ('ELECTRIC MOBILE CARS'),
  ('ELKINGTON'),
  ('EMA'),
  ('ENGINE CONNECTION'),
  ('EQUUS AUTOMOTIVE'),
  ('EV INNOVATIONS'),
  ('EXCALIBUR AUTOMOBILE CORPORATION'),
  ('FALCON MOTORS'),
  ('FAW JIAXING HAPPY MESSENGER'),
  ('FORMULA 1 STREET COM'),
  ('FORTUNESPORT VES'),
  ('GLICKENHAUS'),
  ('GRUPPE B'),
  ('GULLWING INTERNATIONAL MOTORS, LTD'),
  ('HEDLEY STUDIOS'),
  ('HERITAGE'),
  ('HUNTER DESIGN GROUP, LLC'),
  ('IVES MOTORS CORPORATION (IMC)'),
  ('JAC 427'),
  ('KANDI'),
  ('KARMA'),
  ('KEPLER MOTORS');

select
  m.id,
  m.name,
  count(models.id) as model_count
from public.car_makes m
join unwanted_car_makes u
  on regexp_replace(upper(trim(m.name)), '\.$', '') = u.name
left join public.car_models models on models.make_id = m.id
group by m.id, m.name
order by m.name;

select u.name as not_found
from unwanted_car_makes u
left join public.car_makes m
  on regexp_replace(upper(trim(m.name)), '\.$', '') = u.name
where m.id is null
order by u.name;

delete from public.car_makes m
using unwanted_car_makes u
where regexp_replace(upper(trim(m.name)), '\.$', '') = u.name
returning m.id, m.name;
