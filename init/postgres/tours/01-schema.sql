--
-- PostgreSQL database dump
--

\restrict 6ryKu1iXctQvyCs9YGelfDx7dhJ1puqpCur2okSSfl5cI3j0cOygcGP6kHLDVme

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: CompletedKeyPoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CompletedKeyPoints" (
    "Id" uuid NOT NULL,
    "TourExecutionId" uuid NOT NULL,
    "KeyPointId" uuid NOT NULL,
    "CompletedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CompletedKeyPoints" OWNER TO postgres;

--
-- Name: KeyPoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KeyPoints" (
    "Id" uuid NOT NULL,
    "TourId" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "Latitude" double precision NOT NULL,
    "Longitude" double precision NOT NULL,
    "ImageUrl" text,
    "Order" integer NOT NULL
);


ALTER TABLE public."KeyPoints" OWNER TO postgres;

--
-- Name: Reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Reviews" (
    "Id" uuid NOT NULL,
    "TourId" uuid NOT NULL,
    "TouristId" text NOT NULL,
    "TouristUsername" text NOT NULL,
    "TouristEmail" text NOT NULL,
    "Rating" integer NOT NULL,
    "Comment" text NOT NULL,
    "VisitedAt" timestamp with time zone NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "ImageBase64s" text[] NOT NULL
);


ALTER TABLE public."Reviews" OWNER TO postgres;

--
-- Name: TourDurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TourDurations" (
    "Id" uuid NOT NULL,
    "TourId" uuid NOT NULL,
    "TransportType" text NOT NULL,
    "DurationInMinutes" integer NOT NULL
);


ALTER TABLE public."TourDurations" OWNER TO postgres;

--
-- Name: TourExecutions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TourExecutions" (
    "Id" uuid NOT NULL,
    "TourId" uuid NOT NULL,
    "TouristId" text NOT NULL,
    "Status" text NOT NULL,
    "StartedAt" timestamp with time zone NOT NULL,
    "CompletedAt" timestamp with time zone,
    "AbandonedAt" timestamp with time zone,
    "LastActivity" timestamp with time zone NOT NULL,
    "StartLatitude" double precision NOT NULL,
    "StartLongitude" double precision NOT NULL
);


ALTER TABLE public."TourExecutions" OWNER TO postgres;

--
-- Name: Tours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tours" (
    "Id" uuid NOT NULL,
    "AuthorId" text NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "Difficulty" text NOT NULL,
    "Tags" text[] NOT NULL,
    "Status" text NOT NULL,
    "Price" numeric NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "PublishedAt" timestamp with time zone,
    "ArchivedAt" timestamp with time zone,
    "LengthInKm" double precision
);


ALTER TABLE public."Tours" OWNER TO postgres;

--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO postgres;

--
-- Name: CompletedKeyPoints PK_CompletedKeyPoints; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CompletedKeyPoints"
    ADD CONSTRAINT "PK_CompletedKeyPoints" PRIMARY KEY ("Id");


--
-- Name: KeyPoints PK_KeyPoints; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KeyPoints"
    ADD CONSTRAINT "PK_KeyPoints" PRIMARY KEY ("Id");


--
-- Name: Reviews PK_Reviews; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "PK_Reviews" PRIMARY KEY ("Id");


--
-- Name: TourDurations PK_TourDurations; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TourDurations"
    ADD CONSTRAINT "PK_TourDurations" PRIMARY KEY ("Id");


--
-- Name: TourExecutions PK_TourExecutions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TourExecutions"
    ADD CONSTRAINT "PK_TourExecutions" PRIMARY KEY ("Id");


--
-- Name: Tours PK_Tours; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tours"
    ADD CONSTRAINT "PK_Tours" PRIMARY KEY ("Id");


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: IX_KeyPoints_TourId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_KeyPoints_TourId" ON public."KeyPoints" USING btree ("TourId");


--
-- Name: IX_TourDurations_TourId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_TourDurations_TourId" ON public."TourDurations" USING btree ("TourId");


--
-- Name: CompletedKeyPoints FK_CompletedKeyPoints_TourExecutions_TourExecutionId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CompletedKeyPoints"
    ADD CONSTRAINT "FK_CompletedKeyPoints_TourExecutions_TourExecutionId" FOREIGN KEY ("TourExecutionId") REFERENCES public."TourExecutions"("Id") ON DELETE CASCADE;


--
-- Name: KeyPoints FK_KeyPoints_Tours_TourId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KeyPoints"
    ADD CONSTRAINT "FK_KeyPoints_Tours_TourId" FOREIGN KEY ("TourId") REFERENCES public."Tours"("Id") ON DELETE CASCADE;


--
-- Name: Reviews FK_Reviews_Tours_TourId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "FK_Reviews_Tours_TourId" FOREIGN KEY ("TourId") REFERENCES public."Tours"("Id") ON DELETE CASCADE;


--
-- Name: TourDurations FK_TourDurations_Tours_TourId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TourDurations"
    ADD CONSTRAINT "FK_TourDurations_Tours_TourId" FOREIGN KEY ("TourId") REFERENCES public."Tours"("Id") ON DELETE CASCADE;


--
-- Name: TourExecutions FK_TourExecutions_Tours_TourId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TourExecutions"
    ADD CONSTRAINT "FK_TourExecutions_Tours_TourId" FOREIGN KEY ("TourId") REFERENCES public."Tours"("Id") ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 6ryKu1iXctQvyCs9YGelfDx7dhJ1puqpCur2okSSfl5cI3j0cOygcGP6kHLDVme

