-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-11-2025 a las 03:44:42
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

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_all_services` ()   BEGIN
    SELECT * FROM services WHERE active = 1 ORDER BY name ASC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_transactions_by_date` (IN `fecha` DATE)   BEGIN
    SELECT * 
    FROM transactions
    WHERE DATE(created_at) = fecha
    ORDER BY created_at DESC;
END$$

--
-- Funciones
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_total_by_vehicle` (`vehicleId` INT) RETURNS DECIMAL(10,2) DETERMINISTIC BEGIN
    DECLARE suma DECIMAL(10,2);

    SELECT SUM(total)
    INTO suma
    FROM transactions
    WHERE vehicle_id = vehicleId;

    RETURN COALESCE(suma, 0);
END$$

DELIMITER ;

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
(4, 'Aspirado Interior', 12000, 20, 1),
(5, 'Lavado de Motor', 20000, 45, 1),
(8, 'Lavado xp', 60, 15, 1),
(9, 'lavado + brillada', 30000, 40, 1),
(17, 'lavado + polichado', 20000, 15, 1);

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
(26, 19, 12000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-22 11:33:16'),
(27, 24, 12000, 'efectivo', '1', 'secretario', 'Completado', '2025-09-23 13:43:17'),
(28, 25, 12000, 'efectivo', '2', 'secretario', 'Completado', '2025-09-23 14:18:05'),
(29, 26, 37000, 'efectivo', 'María López', 'secretario', 'Completado', '2025-09-23 17:07:58'),
(30, 27, 35000, 'efectivo', 'Carlos Gómez', 'secretario', 'Completado', '2025-09-24 01:45:06'),
(31, 28, 12000, 'efectivo', 'María López', 'secretario', 'Completado', '2025-09-24 05:11:57'),
(32, 29, 20000, 'efectivo', '', '', 'Completado', '2025-10-04 02:23:43'),
(33, 30, 35000, 'efectivo', '', '', 'Completado', '2025-11-02 16:02:51'),
(34, 31, 20000, 'efectivo', '', '', 'Completado', '2025-11-04 01:00:48'),
(35, 32, 20000, 'efectivo', '', '', 'Completado', '2025-11-06 01:01:20'),
(36, 33, 32000, 'efectivo', '', '', 'Completado', '2025-11-06 01:24:56'),
(37, 34, 20000, 'efectivo', '', '', 'Completado', '2025-11-06 03:37:45'),
(38, 35, 20000, 'efectivo', '', '', 'Completado', '2025-11-06 04:16:48'),
(39, 36, 32000, 'efectivo', '', '', 'Completado', '2025-11-06 10:11:07'),
(40, 37, 62000, 'efectivo', '', '', 'Completado', '2025-11-06 10:49:18'),
(41, 3, 30000, 'efectivo', '', '', 'Completado', '2025-11-06 11:18:04'),
(42, 38, 60, 'efectivo', '', '', 'Completado', '2025-11-06 14:20:51'),
(43, 39, 32000, 'efectivo', '', '', 'Completado', '2025-11-06 15:46:30'),
(44, 40, 62000, 'efectivo', '', '', 'Completado', '2025-11-15 19:24:35'),
(45, 38, 20000, 'efectivo', '', '', 'Completado', '2025-11-15 19:38:10'),
(46, 41, 20000, 'efectivo', '', '', 'Completado', '2025-11-15 20:48:29'),
(47, 42, 32000, 'efectivo', '', '', 'Completado', '2025-11-16 17:05:42'),
(48, 43, 42000, 'efectivo', '', '', 'Completado', '2025-11-17 14:55:22'),
(49, 44, 32000, 'efectivo', '', '', 'Completado', '2025-11-20 23:07:25'),
(50, 45, 12000, 'efectivo', '', '', 'Completado', '2025-11-22 03:26:51');

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
(11, 6, 4),
(16, 11, 5),
(19, 16, 5),
(21, 18, 5),
(22, 26, 4),
(23, 27, 4),
(24, 28, 4),
(26, 29, 4),
(28, 31, 4),
(29, 32, 5),
(31, 34, 5),
(32, 35, 5),
(33, 36, 4),
(34, 36, 5),
(35, 37, 5),
(36, 38, 5),
(37, 39, 5),
(38, 39, 4),
(39, 40, 4),
(40, 40, 5),
(41, 40, 9),
(42, 41, 9),
(43, 42, 8),
(44, 43, 4),
(45, 43, 5),
(46, 44, 5),
(47, 44, 4),
(48, 44, 9),
(49, 45, 5),
(50, 46, 5),
(51, 47, 4),
(52, 47, 5),
(53, 48, 9),
(54, 48, 4),
(55, 49, 4),
(56, 49, 5),
(57, 50, 4);

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
(1, 'Administrador', 'admin', '$2b$10$hxYWT1698/2FKCT7CcCoP.VBsVyViqgRhAfbZutaPHK9jHrNzVqRm', 'admin', 1, '2025-09-12 02:37:11'),
(3, 'Secretario', 'secretario', '$2b$10$4ypW.5.zt3m0y8jW7yhNWO3ACJQF3dJMZAIK0n8F1xJ9vX3Y7j5CW', 'secretary', 1, '2025-09-21 15:21:02');

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
(3, 'VAC090', 'camioneta', 'Valentina cossio', '+573157235760', 2, '2025-09-13 17:06:02'),
(4, 'GTO907', 'camioneta', 'Juliana Valencia', '+573001777892', NULL, '2025-09-14 15:48:54'),
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
(19, 'HHS782', 'carro', 'Marlon santos', '3214552667', 2, '2025-09-22 11:33:16'),
(24, 'ZZZ000', 'carro', 'Julian valencia', '3333333333', 1, '2025-09-23 13:43:17'),
(25, 'MKD78G', 'carro', 'Carolina balanta', '3157235683', 2, '2025-09-23 14:18:05'),
(26, 'TYY789', 'carro', 'Juan manuel estrada', '3295550000', 2, '2025-09-23 17:07:58'),
(27, 'JHH23K', 'carro', 'Andres caicedo', '3110000000', 3, '2025-09-24 01:45:05'),
(28, 'JJJ000', 'carro', 'Juan diego casanova', '3104993010', 2, '2025-09-24 05:11:57'),
(29, 'JHU83B', 'moto', 'Juan Antonio candelo', '+573290037300', 3, '2025-10-04 02:23:43'),
(30, 'ARQ233', 'camioneta', 'Luis Ángel Castaño', '+573119001234', 1, '2025-11-02 16:02:51'),
(31, 'DRD234', 'carro', 'Marcela juanillo', '+573220503278', 1, '2025-11-04 01:00:48'),
(32, 'QTY34S', 'moto', 'Juan manuel Agamez', '+573189208000', 1, '2025-11-06 01:01:20'),
(33, 'ZIZ100', 'carro', 'Juan daniel caicedo', '+573115227792', 2, '2025-11-06 01:24:56'),
(34, 'AZQ123', 'camioneta', 'Andrea beltran', '+573000905683', 1, '2025-11-06 03:37:45'),
(35, 'ERY100', 'carro', 'Franca alarco', '+573258970000', 1, '2025-11-06 04:16:48'),
(36, 'ODH23H', 'moto', 'Yuli Marín', '+573240894300', NULL, '2025-11-06 10:11:07'),
(37, 'EDE344', 'camioneta', 'Sofia villegas', '+573157235780', 3, '2025-11-06 10:49:18'),
(38, 'CAM123', 'carro', 'Camila santos', '+573218900023', 2, '2025-11-06 14:20:51'),
(39, 'ABW12G', 'moto', 'Juan montaño', '+573217072345', 1, '2025-11-06 15:46:30'),
(40, 'QRZ900', 'camioneta', 'Maria José Beltrán', '+573104790123', 8, '2025-11-15 19:24:35'),
(41, 'RRR67D', 'moto', 'Juan diego Sinisterra', '+573229028903', 9, '2025-11-15 20:48:29'),
(42, 'GRD16H', 'moto', 'Angel chavez', '+573207957277', 3, '2025-11-16 17:05:42'),
(43, 'NRS127', 'carro', 'Juan diego soto', '+573159205783', 9, '2025-11-17 14:55:22'),
(44, 'TGH88H', 'moto', 'Juan fernando solis', '+573105904327', 9, '2025-11-20 23:07:25'),
(45, 'AZR344', 'camioneta', 'Michael popo peréz', '+573116790870', NULL, '2025-11-22 03:26:51');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_transacciones_detalladas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_transacciones_detalladas` (
`transaction_id` int(11)
,`total` int(11)
,`payment_method` enum('efectivo','tarjeta','transferencia')
,`status` enum('Completado','En proceso')
,`created_at` timestamp
,`plate` varchar(10)
,`type` enum('carro','moto','camioneta')
,`owner` varchar(100)
,`phone` varchar(20)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `washers`
--

CREATE TABLE `washers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `vehicles_washed` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `washers`
--

INSERT INTO `washers` (`id`, `name`, `active`, `vehicles_washed`, `created_at`) VALUES
(1, 'Juan Pérez', 1, 0, '2025-09-12 22:46:41'),
(2, 'María López', 1, 0, '2025-09-12 22:46:41'),
(3, 'Carlos Gómez', 1, 0, '2025-09-12 22:46:41'),
(8, 'Maria jose cano', 1, 0, '2025-11-11 11:53:30'),
(9, 'Yina montolla', 1, 0, '2025-11-11 13:04:56'),
(10, 'Juan pablo diaz', 1, 0, '2025-11-26 08:48:50');

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_transacciones_detalladas`
--
DROP TABLE IF EXISTS `vista_transacciones_detalladas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_transacciones_detalladas`  AS SELECT `t`.`id` AS `transaction_id`, `t`.`total` AS `total`, `t`.`payment_method` AS `payment_method`, `t`.`status` AS `status`, `t`.`created_at` AS `created_at`, `v`.`plate` AS `plate`, `v`.`type` AS `type`, `v`.`owner` AS `owner`, `v`.`phone` AS `phone` FROM (`transactions` `t` left join `vehicles` `v` on(`t`.`vehicle_id` = `v`.`id`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_active` (`active`);

--
-- Indices de la tabla `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_vehicle_id` (`vehicle_id`);

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
  ADD KEY `fk_vehicles_washer` (`washer_id`),
  ADD KEY `idx_plate` (`plate`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `transaction_services`
--
ALTER TABLE `transaction_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `washers`
--
ALTER TABLE `washers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
