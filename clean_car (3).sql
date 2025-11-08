-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-11-2025 a las 01:46:49
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `clean_car`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` int(11) NOT NULL,
  `duration` int(11) NOT NULL,
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `services`
--

INSERT INTO `services` (`id`, `name`, `price`, `duration`, `active`) VALUES
(3, 'Encerado', 35000, 90, 1),
(4, 'Aspirado Interior', 12000, 20, 1),
(5, 'Lavado de Motor', 20000, 45, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `payment_method` enum('efectivo','tarjeta','transferencia') NOT NULL DEFAULT 'efectivo',
  `washer` varchar(100) NOT NULL,
  `secretary` varchar(100) NOT NULL,
  `status` enum('Completado','En proceso') DEFAULT 'Completado',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `transactions`
--

INSERT INTO `transactions` (`id`, `vehicle_id`, `total`, `payment_method`, `washer`, `secretary`, `status`, `created_at`) VALUES
(1, 1, 15000, 'efectivo', '', '', 'Completado', '2025-09-13 13:07:28'),
(2, 2, 27000, 'efectivo', '', '', 'Completado', '2025-09-13 13:09:08'),
(3, 3, 37000, 'efectivo', '', '', 'Completado', '2025-09-13 17:06:02'),
(4, 4, 60000, 'efectivo', '', '', 'Completado', '2025-09-14 15:48:54'),
(5, 5, 60000, 'efectivo', '', '', 'Completado', '2025-09-15 13:36:28'),
(6, 6, 37000, 'efectivo', '', '', 'Completado', '2025-09-15 20:25:30'),
(7, 7, 15000, 'efectivo', '', '', 'Completado', '2025-09-15 20:40:28'),
(8, 8, 35000, 'efectivo', '', '', 'Completado', '2025-09-15 21:00:06'),
(9, 9, 35000, 'efectivo', '', '', 'Completado', '2025-09-16 14:51:21'),
(10, 10, 35000, 'efectivo', '', '', 'Completado', '2025-09-16 18:15:51'),
(11, 11, 20000, 'efectivo', '', '', 'Completado', '2025-09-16 22:44:56'),
(12, 12, 40000, 'efectivo', '', '', 'Completado', '2025-09-17 12:00:50'),
(13, 13, 25000, 'efectivo', '', '', 'Completado', '2025-09-17 15:21:34'),
(16, 15, 20000, 'efectivo', 'María López', 'secretario', 'Completado', '2025-09-22 02:34:02'),
(18, 17, 20000, 'efectivo', 'Carlos Gómez', 'secretario', 'Completado', '2025-09-22 11:14:34'),
(19, 18, 35000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-22 11:30:04'),
(20, 18, 35000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-22 11:30:07'),
(21, 18, 35000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-22 11:30:08'),
(22, 18, 35000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-22 11:30:09'),
(23, 18, 35000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-22 11:30:09'),
(24, 18, 35000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-22 11:30:09'),
(25, 18, 35000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-22 11:30:10'),
(26, 19, 12000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-22 11:33:16'),
(27, 24, 12000, 'efectivo', '1', 'secretario', 'Completado', '2025-09-23 13:43:17'),
(28, 25, 12000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-23 14:18:05'),
(29, 26, 37000, 'efectivo', 'María López', 'secretario', 'Completado', '2025-09-23 17:07:58'),
(30, 27, 35000, 'efectivo', 'Carlos Gómez', 'secretario', 'Completado', '2025-09-24 01:45:06'),
(31, 28, 12000, 'efectivo', 'María López', 'secretario', 'Completado', '2025-09-24 05:11:57'),
(32, 29, 20000, 'efectivo', '', '', 'Completado', '2025-10-04 02:23:43'),
(33, 30, 35000, 'efectivo', '', '', 'Completado', '2025-11-02 16:02:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transaction_services`
--

CREATE TABLE `transaction_services` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `transaction_services`
--

INSERT INTO `transaction_services` (`id`, `transaction_id`, `service_id`) VALUES
(3, 2, 4),
(5, 3, 4),
(7, 4, 3),
(9, 5, 3),
(11, 6, 4),
(13, 8, 3),
(14, 9, 3),
(15, 10, 3),
(16, 11, 5),
(19, 16, 5),
(21, 18, 5),
(22, 26, 4),
(23, 27, 4),
(24, 28, 4),
(26, 29, 4),
(27, 30, 3),
(28, 31, 4),
(29, 32, 5),
(30, 33, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','secretary') NOT NULL DEFAULT 'secretary',
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `active`, `created_at`) VALUES
(1, 'Administrador', 'admin', '1234', 'admin', 1, '2025-09-12 02:37:11'),
(3, 'Secretario', 'secretario', '1234', 'secretary', 1, '2025-09-21 15:21:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `plate` varchar(10) NOT NULL,
  `type` enum('carro','moto','camioneta') NOT NULL,
  `owner` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `washer_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vehicles`
--

INSERT INTO `vehicles` (`id`, `plate`, `type`, `owner`, `phone`, `washer_id`, `created_at`) VALUES
(1, 'AHC289', 'carro', 'Juan carlos vargas', '+573176780936', 3, '2025-09-13 13:07:28'),
(2, 'MRA12O', 'moto', 'Maria victoria carabali', '+573235830911', 2, '2025-09-13 13:09:08'),
(3, 'VAC090', 'camioneta', 'Valentina cossio', '+573172228930', 2, '2025-09-13 17:06:02'),
(4, 'GTO907', 'camioneta', 'Juliana Valencia', '+573001777892', 1, '2025-09-14 15:48:54'),
(5, 'ABC24F', 'moto', 'jean carlos campo', '+573125690567', 3, '2025-09-15 13:36:28'),
(6, 'RNI980', 'camioneta', 'Juan pablo diaz', '+573110007766', 3, '2025-09-15 20:25:30'),
(7, 'QTL45D', 'moto', 'Maria camila carabali', '+573158922587', 1, '2025-09-15 20:40:28'),
(8, 'BYP679', 'carro', 'Juan esteban montaño', '+573145670012', 1, '2025-09-15 21:00:06'),
(9, 'JDK990', 'carro', 'Keren daiana solis', '+573235639001', 1, '2025-09-16 14:51:21'),
(10, 'WHK23F', 'moto', 'juan caicedo', '+573245642266', 1, '2025-09-16 18:15:51'),
(11, 'ARK903', 'carro', 'Lina jaramillo', '+573126843312', 2, '2025-09-16 22:44:56'),
(12, 'ABC124', 'camioneta', 'Juan miguel bedoya', '+573217063559', 1, '2025-09-17 12:00:50'),
(13, 'QQL20X', 'moto', 'Ana maria caicedo', '+573000233389', 1, '2025-09-17 15:21:34'),
(14, 'ABZ123', 'carro', 'Juan camilo ibañez', '3125679024', NULL, '2025-09-22 02:05:18'),
(15, 'MSG45D', 'carro', 'Juan Valdez', '3157235783', NULL, '2025-09-22 02:34:02'),
(17, 'NNN766', 'carro', 'kjjhg  ggg', '3234556778', NULL, '2025-09-22 11:14:34'),
(18, 'GST203', 'carro', 'Marlon santos', '3245638000', 2, '2025-09-22 11:30:04'),
(19, 'HHS782', 'carro', 'Marlon santos', '3214552667', 2, '2025-09-22 11:33:16'),
(24, 'ZZZ000', 'carro', 'Julian valencia', '3333333333', 1, '2025-09-23 13:43:17'),
(25, 'MKD78G', 'carro', 'Carolina balanta', '3157235683', 2, '2025-09-23 14:18:05'),
(26, 'TYY789', 'carro', 'Juan manuel estrada', '3295550000', 2, '2025-09-23 17:07:58'),
(27, 'JHH23K', 'carro', 'Andres caicedo', '3110000000', 3, '2025-09-24 01:45:05'),
(28, 'JJJ000', 'carro', 'Juan diego casanova', '3104993010', 2, '2025-09-24 05:11:57'),
(29, 'JHU83B', 'moto', 'Juan Antonio candelo', '+573290037300', 3, '2025-10-04 02:23:43'),
(30, 'ARQ233', 'camioneta', 'Luis Ángel Castaño', '+573119001234', 1, '2025-11-02 16:02:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `washers`
--

CREATE TABLE `washers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `washers`
--

INSERT INTO `washers` (`id`, `name`, `created_at`) VALUES
(1, 'Juan Pérez', '2025-09-12 22:46:41'),
(2, 'María López', '2025-09-12 22:46:41'),
(3, 'Carlos Gómez', '2025-09-12 22:46:41');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

--
-- Indices de la tabla `transaction_services`
--
ALTER TABLE `transaction_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plate` (`plate`),
  ADD KEY `fk_vehicles_washer` (`washer_id`);

--
-- Indices de la tabla `washers`
--
ALTER TABLE `washers`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `transaction_services`
--
ALTER TABLE `transaction_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `washers`
--
ALTER TABLE `washers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `transaction_services`
--
ALTER TABLE `transaction_services`
  ADD CONSTRAINT `transaction_services_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `fk_vehicles_washer` FOREIGN KEY (`washer_id`) REFERENCES `washers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
