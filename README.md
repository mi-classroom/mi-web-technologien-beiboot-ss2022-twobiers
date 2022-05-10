# About

Link: [https://mi-classroom.github.io/mi-web-technologien-beiboot-ss2022-twobiers/](https://mi-classroom.github.io/mi-web-technologien-beiboot-ss2022-twobiers/)

## Web Technologien // begleitendes Projekt Sommersemester 2022 (DE)

Zum Modul Web Technologien gibt es ein begleitendes Projekt. Im Rahmen dieses Projekts werden wir von Veranstaltung zu Veranstaltung ein Projekt sukzessive weiter entwickeln und uns im Rahmen der Veranstaltung den Fortschritt anschauen, Code Reviews machen und Entwicklungsschritte vorstellen und diskutieren.

Als organisatorischen Rahmen für das Projekt nutzen wir GitHub Classroom. Inhaltlich befassen wir uns mit der Entwicklung einer kleinen Web-Anwendung für die Bearbeitung von Bildern. Hierbei steht weniger ein professioneller Konzeptions-, Entwurfs- und Entwicklungsprozess im Vordergrund, sondern vielmehr die sukzessive Weiterentwicklung einer Anwendung, das Ausprobieren, Vergleichen, Refactoren und die Freude an lauffähigem Code.

## Why is everything in English instead of German?

I'd like to focus on English in my open source projects as much as possible, so that if someone (by any chance) comes across the repository and can possibly take advantage of it and they can do something with it.

## Maintainer

[Tobias Hund](https://github.com/twobiers)

# Run

Prerequisites:
- [Node.js LTS](https://nodejs.org/en/) 

**or**

- [Docker](https://www.docker.com/)

## Run locally 
1. Run
```
npm run dev
```
2. Go to [http://localhost:3000/](http://localhost:3000/)

## Run with docker

1. Build the container image
```
docker build . -t beiboot-twobiers:latest
```
2. Run the container
```
docker run --rm -d -p 3000:80 --name beiboot-twobiers beiboot-twobiers:latest
```
3. Go to [http://localhost:3000/](http://localhost:3000/)
4. Stop the container
```
docker stop beiboot-twobiers
```