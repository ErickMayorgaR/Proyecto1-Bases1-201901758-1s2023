const { Router } = require('express');
const router = Router();

const DataBase = require('../Controllers/databaseQueries.js');



//gets


router.get("/consulta1", (req, res) => DataBase.consulta(req, res, 1));
router.get("/consulta2", (req, res) => DataBase.consulta(req, res, 2));
router.get("/consulta3", (req, res) => DataBase.consulta(req, res, 3));
router.get("/consulta4", (req, res) => DataBase.consulta(req, res, 4));
router.get("/consulta5", (req, res) => DataBase.consulta(req, res, 5));
router.get("/consulta6", (req, res) => DataBase.consulta(req, res, 6));
router.get("/consulta7", (req, res) => DataBase.consulta(req, res, 7));
router.get("/consulta8", (req, res) => DataBase.consulta(req, res, 8));
router.get("/consulta9", (req, res) => DataBase.consulta(req, res, 9));
router.get("/consulta10", (req, res) =>DataBase.consulta(req, res, 10));

router.get("/eliminarTemporal", DataBase.eliminarTemporal)
router.get("/eliminarModelo",DataBase.eliminarModelo)
router.get("/cargarTemporal",DataBase.cargarTemporal)
router.get("/cargarModelo", DataBase.cargarModelo)

module.exports = router;