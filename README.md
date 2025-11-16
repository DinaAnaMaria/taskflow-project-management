# taskflow-project-management
Aplicație web pentru managementul proiectelor și planificarea task-urilor.
TaskFlow – Aplicație Web pentru Managementul Proiectelor și Planificarea Task-urilor
1. Descriere generală
TaskFlow este o aplicație web de tip SPA (Single Page Application) destinată managementului proiectelor și planificării activităților într-o echipă. Sistemul permite crearea proiectelor, definirea și alocarea task-urilor, precum și urmărirea progresului acestora.
Front-end-ul comunică cu back-end-ul printr-un REST API, asigurând o experiență rapidă, scalabilă și accesibilă pe orice dispozitiv.

2. Obiective
•	Gestionarea proiectelor și a echipelor.
•	Planificarea și urmărirea task-urilor.
•	Atribuirea rolurilor utilizatorilor.
•	Monitorizarea progresului și păstrarea unui istoric al acțiunilor.
•	Interfață adaptată dispozitivelor desktop și mobile.

3. Arhitectură
Aplicația este formată din trei componente principale:
• Front-end (SPA)
•	Framework recomandat: React / Angular / Vue
•	Interacțiune cu API prin request-uri HTTP
•	Navigare rapidă și randare dinamică a componentelor
• Back-end (REST API)
•	Tehnologii posibile: Node.js (Express), Java Spring, Python (Flask/Django), .NET
•	Gestionarea autentificării, autorizării și logicii aplicației
•	Expunerea endpoint-urilor: utilizatori, proiecte, task-uri, istoric
• Baza de date
•	MySQL 
•	Organizată pe entități: utilizatori, proiecte, task-uri, membri, istoric
•	Structură conform ERD-ului de mai jos

4. Roluri în aplicație
Administrator
•	Creează utilizatori și stabilește rolurile acestora
•	Asociază executanți managerilor
•	Poate vizualiza toate proiectele
Manager
•	Creează proiecte și task-uri
•	Alocă membri în proiect
•	Asignează task-uri executanților
•	Marchează task-urile finalizate ca CLOSED
•	Vizualizează istoricul proiectelor și al utilizatorilor
Executant
•	Vizualizează task-urile alocate
•	Marchează task-urile ca COMPLETED
•	Poate consulta istoricul personal

5. Funcționalități principale
5.1 Utilizatori
•	Creare utilizatori
•	Atribuire roluri
•	Alocare manager pentru executanți
5.2 Proiecte
•	Creare și editare proiecte
•	Gestionarea membrilor proiectului
•	Vizualizarea progresului prin statusul task-urilor
5.3 Task-uri
Stări posibile:
•	OPEN – creat
•	PENDING – alocat
•	COMPLETED – finalizat de executant
•	CLOSED – aprobat de manager
Operațiuni:
•	Creare task-uri
•	Alocare task-uri
•	Finalizare task-uri (executant)
•	Închidere task-uri (manager)
•	Istoric acțiuni pentru fiecare task

6. Diagrama ERD – Structura bazei de date
Diagrama bazei de date a aplicației TaskFlow este organizată în jurul entităților principale: utilizatori, proiecte, task-uri și istoricul acestora.
Table users {
  user_id        integer [primary key]
  first_name     varchar
  last_name      varchar
  email          varchar
  password       varchar
  role           varchar   // admin, manager, executant
  manager_id     integer   // FK către users.user_id
}

Table projects {
  project_id     integer [primary key]
  name           varchar
  description    text
  created_by     integer // FK către users.user_id (manager)
  created_at     datetime
}

Table project_members {
  id             integer [primary key]
  project_id     integer // FK către projects.project_id
  user_id        integer // FK către users.user_id
}

Table tasks {
  task_id        integer [primary key]
  project_id     integer // FK către projects.project_id
  title          varchar
  description    text
  assigned_to    integer // FK către users.user_id
  status         varchar // OPEN, PENDING, COMPLETED, CLOSED
  created_by     integer // FK către users.user_id
  created_at     datetime
}

Table task_history {
  history_id     integer [primary key]
  task_id        integer // FK către tasks.task_id
  user_id        integer // FK către users.user_id
  action         varchar // created, assigned, completed, closed
  timestamp      datetime
}
Relatii:
Ref: users.manager_id > users.user_id

Ref: projects.created_by > users.user_id

Ref: project_members.project_id > projects.project_id
Ref: project_members.user_id > users.user_id

Ref: tasks.project_id > projects.project_id
Ref: tasks.assigned_to > users.user_id
Ref: tasks.created_by > users.user_id

Ref: task_history.task_id > tasks.task_id
Ref: task_history.user_id > users.user_id
Descriere relații:
•	Un manager poate avea mai mulți executanți (1:N)
•	Un proiect poate avea mulți membri (N:N prin tabelul project_members)
•	Un task aparține unui singur proiect (1:N)
•	Un task este asignat unui utilizator (1:N)
•	Un task poate conține mai multe intrări în task_history (1:N)
•	Un manager poate crea mai multe proiecte (1:N)

 
TaskFlow – Aplicație Web pentru Managementul Proiectelor și Planificarea Task-urilor
1. Descriere generală
TaskFlow este o aplicație web de tip SPA (Single Page Application) destinată managementului proiectelor și planificării activităților într-o echipă. Sistemul permite crearea proiectelor, definirea și alocarea task-urilor, precum și urmărirea progresului acestora.
Front-end-ul comunică cu back-end-ul printr-un REST API, asigurând o experiență rapidă, scalabilă și accesibilă pe orice dispozitiv.
________________________________________
2. Obiective
•	Gestionarea proiectelor și a echipelor.
•	Planificarea și urmărirea task-urilor.
•	Atribuirea rolurilor utilizatorilor.
•	Monitorizarea progresului și păstrarea unui istoric al acțiunilor.
•	Interfață adaptată dispozitivelor desktop și mobile.
________________________________________
3. Arhitectură
Aplicația este formată din trei componente principale:
• Front-end (SPA)
•	Framework recomandat: React / Angular / Vue
•	Interacțiune cu API prin request-uri HTTP
•	Navigare rapidă și randare dinamică a componentelor
• Back-end (REST API)
•	Tehnologii posibile: Node.js (Express), Java Spring, Python (Flask/Django), .NET
•	Gestionarea autentificării, autorizării și logicii aplicației
•	Expunerea endpoint-urilor: utilizatori, proiecte, task-uri, istoric
• Baza de date
•	MySQL 
•	Organizată pe entități: utilizatori, proiecte, task-uri, membri, istoric
•	Structură conform ERD-ului de mai jos
________________________________________
4. Roluri în aplicație
Administrator
•	Creează utilizatori și stabilește rolurile acestora
•	Asociază executanți managerilor
•	Poate vizualiza toate proiectele
Manager
•	Creează proiecte și task-uri
•	Alocă membri în proiect
•	Asignează task-uri executanților
•	Marchează task-urile finalizate ca CLOSED
•	Vizualizează istoricul proiectelor și al utilizatorilor
Executant
•	Vizualizează task-urile alocate
•	Marchează task-urile ca COMPLETED
•	Poate consulta istoricul personal
________________________________________
5. Funcționalități principale
5.1 Utilizatori
•	Creare utilizatori
•	Atribuire roluri
•	Alocare manager pentru executanți
5.2 Proiecte
•	Creare și editare proiecte
•	Gestionarea membrilor proiectului
•	Vizualizarea progresului prin statusul task-urilor
5.3 Task-uri
Stări posibile:
•	OPEN – creat
•	PENDING – alocat
•	COMPLETED – finalizat de executant
•	CLOSED – aprobat de manager
Operațiuni:
•	Creare task-uri
•	Alocare task-uri
•	Finalizare task-uri (executant)
•	Închidere task-uri (manager)
•	Istoric acțiuni pentru fiecare task
________________________________________
6. Diagrama ERD – Structura bazei de date
Diagrama bazei de date a aplicației TaskFlow este organizată în jurul entităților principale: utilizatori, proiecte, task-uri și istoricul acestora.
Table users {
  user_id        integer [primary key]
  first_name     varchar
  last_name      varchar
  email          varchar
  password       varchar
  role           varchar   // admin, manager, executant
  manager_id     integer   // FK către users.user_id
}

Table projects {
  project_id     integer [primary key]
  name           varchar
  description    text
  created_by     integer // FK către users.user_id (manager)
  created_at     datetime
}

Table project_members {
  id             integer [primary key]
  project_id     integer // FK către projects.project_id
  user_id        integer // FK către users.user_id
}

Table tasks {
  task_id        integer [primary key]
  project_id     integer // FK către projects.project_id
  title          varchar
  description    text
  assigned_to    integer // FK către users.user_id
  status         varchar // OPEN, PENDING, COMPLETED, CLOSED
  created_by     integer // FK către users.user_id
  created_at     datetime
}

Table task_history {
  history_id     integer [primary key]
  task_id        integer // FK către tasks.task_id
  user_id        integer // FK către users.user_id
  action         varchar // created, assigned, completed, closed
  timestamp      datetime
}
Relatii:
Ref: users.manager_id > users.user_id

Ref: projects.created_by > users.user_id

Ref: project_members.project_id > projects.project_id
Ref: project_members.user_id > users.user_id

Ref: tasks.project_id > projects.project_id
Ref: tasks.assigned_to > users.user_id
Ref: tasks.created_by > users.user_id

Ref: task_history.task_id > tasks.task_id
Ref: task_history.user_id > users.user_id
Descriere relații:
•	Un manager poate avea mai mulți executanți (1:N)
•	Un proiect poate avea mulți membri (N:N prin tabelul project_members)
•	Un task aparține unui singur proiect (1:N)
•	Un task este asignat unui utilizator (1:N)
•	Un task poate conține mai multe intrări în task_history (1:N)
•	Un manager poate crea mai multe proiecte (1:N)

 


