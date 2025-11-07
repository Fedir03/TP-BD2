const serverUrl = process.env.SWAGGER_SERVER_URL || "http://localhost:3000";

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "API Aseguradora - Persistencia Poliglota",
    version: "1.0.0",
    description:
      "API de consultas sobre datos cargados en MongoDB y Neo4j. Permite explorar clientes, pólizas, siniestros y vehículos.",
    contact: {
      name: "Equipo BD2",
      email: "maahumada@itba.edu.ar"
    }
  },
  servers: [
    {
      url: serverUrl,
      description: "Servidor de la API"
    }
  ],
  tags: [
    {
      name: "Health",
      description: "Estado general del servicio"
    },
    {
      name: "MongoDB",
      description: "Consultas respaldadas por MongoDB"
    },
    {
      name: "Neo4j",
      description: "Consultas respaldadas por Neo4j"
    }
  ],
  components: {
    responses: {
      ServerError: {
        description: "Error inesperado en el servidor.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: "Algo salió mal" }
              }
            }
          }
        }
      }
    },
    schemas: {
      HealthResponse: {
        type: "string",
        example: "API Aseguradora funcionando"
      },
      PolizaResumen: {
        type: "object",
        properties: {
          nro_poliza: { type: "string", example: "PZ-1001" }
        }
      },
      ClienteActivo: {
        type: "object",
        properties: {
          nombre: { type: "string", example: "Juan Perez" },
          polizas_vigentes: {
            type: "array",
            items: { $ref: "#/components/schemas/PolizaResumen" }
          }
        }
      },
      ClienteSinPoliza: {
        type: "object",
        properties: {
          nombre: { type: "string", example: "Maria Gomez" }
        }
      },
      ClienteNombreApellido: {
        type: "object",
        properties: {
          nombre: { type: "string" },
          apellido: { type: "string" }
        }
      },
      PolizaVencida: {
        type: "object",
        properties: {
          nro_poliza: { type: "string", example: "PZ-2002" },
          cliente: { $ref: "#/components/schemas/ClienteNombreApellido" }
        }
      },
      ClienteCobertura: {
        type: "object",
        properties: {
          cliente: { type: "string", example: "Miguel" },
          total_cobertura: { type: "integer", example: 2500000 }
        }
      },
      SiniestroAccidente: {
        type: "object",
        properties: {
          id_siniestro: { type: "string", example: "SIN-44" }
        }
      },
      PolizaSuspendida: {
        type: "object",
        properties: {
          nro_poliza: { type: "string", example: "PZ-3003" },
          cliente: {
            type: "object",
            properties: {
              estado: { type: "string", example: "Inactivo" }
            }
          }
        }
      },
      AgentePolizas: {
        type: "object",
        properties: {
          nombre: { type: "string" },
          apellido: { type: "string" },
          polizas: { type: "integer", example: 12 }
        }
      },
      AgenteSiniestros: {
        type: "object",
        properties: {
          nombre: { type: "string" },
          apellido: { type: "string" },
          siniestros: { type: "integer", example: 8 }
        }
      },
      ClienteMultivehiculo: {
        type: "object",
        properties: {
          nombre: { type: "string" },
          apellido: { type: "string" },
          vehiculos: { type: "integer", example: 3 }
        }
      },
      SiniestroAbierto: {
        type: "object",
        properties: {
          tipo: { type: "string", example: "Accidente" },
          monto: { type: "number", example: 150000 },
          nombre_cliente: { type: "string" },
          apellido_cliente: { type: "string" }
        }
      },
      VehiculoAsegurado: {
        type: "object",
        properties: {
          nombre: { type: "string" },
          apellido: { type: "string" },
          patente: { type: "string", example: "AA123BB" },
          nro_poliza: { type: "string", example: "PZ-1010" }
        }
      }
    }
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Validar estado del servicio",
        description: "Devuelve un mensaje simple para confirmar que la API está activa.",
        responses: {
          200: {
            description: "Mensaje de estado.",
            content: {
              "text/plain": {
                schema: { $ref: "#/components/schemas/HealthResponse" }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/mongo/clientes-activos": {
      get: {
        tags: ["MongoDB"],
        summary: "Clientes con pólizas vigentes",
        description:
          "Devuelve los clientes activos que poseen al menos una póliza vigente junto a sus números de póliza.",
        responses: {
          200: {
            description: "Listado de clientes activos.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ClienteActivo" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/mongo/clientes-sin-polizas": {
      get: {
        tags: ["MongoDB"],
        summary: "Clientes sin pólizas activas",
        description: "Regresa los clientes que no poseen ninguna póliza vigente.",
        responses: {
          200: {
            description: "Listado de clientes sin pólizas activas.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ClienteSinPoliza" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/mongo/polizas-vencidas": {
      get: {
        tags: ["MongoDB"],
        summary: "Pólizas vencidas",
        description: "Obtiene todas las pólizas vencidas y los datos básicos del cliente asociado.",
        responses: {
          200: {
            description: "Listado de pólizas vencidas con cliente.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PolizaVencida" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/mongo/top-clientes-cobertura": {
      get: {
        tags: ["MongoDB"],
        summary: "Top clientes por cobertura",
        description: "Calcula los 10 clientes con mayor monto total de cobertura acumulada.",
        responses: {
          200: {
            description: "Ranking de clientes.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ClienteCobertura" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/mongo/siniestros-tipo-accidente": {
      get: {
        tags: ["MongoDB"],
        summary: "Siniestros por accidente del último año",
        description: "Devuelve siniestros de tipo accidente registrados en los últimos 12 meses.",
        responses: {
          200: {
            description: "Listado de siniestros por accidente.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SiniestroAccidente" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/mongo/polizas-suspendidas": {
      get: {
        tags: ["MongoDB"],
        summary: "Pólizas suspendidas",
        description: "Lista las pólizas suspendidas y el estado actual del cliente asociado.",
        responses: {
          200: {
            description: "Listado de pólizas suspendidas.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PolizaSuspendida" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/neo/agentes-polizas": {
      get: {
        tags: ["Neo4j"],
        summary: "Agentes y pólizas emitidas",
        description: "Obtiene agentes activos y la cantidad de pólizas que emitieron.",
        responses: {
          200: {
            description: "Listado de agentes por cantidad de pólizas.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AgentePolizas" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/neo/agentes-siniestros": {
      get: {
        tags: ["Neo4j"],
        summary: "Agentes y siniestros asociados",
        description: "Retorna los agentes y la cantidad de siniestros asociados a sus pólizas.",
        responses: {
          200: {
            description: "Listado de agentes con siniestros.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AgenteSiniestros" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/neo/clientes-multivehiculo": {
      get: {
        tags: ["Neo4j"],
        summary: "Clientes con múltiples vehículos",
        description: "Clientes que poseen más de un vehículo asegurado.",
        responses: {
          200: {
            description: "Listado de clientes multivehículo.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ClienteMultivehiculo" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/neo/siniestros-abiertos": {
      get: {
        tags: ["Neo4j"],
        summary: "Siniestros abiertos y cliente afectado",
        description: "Lista siniestros abiertos mostrando tipo, monto y los datos del cliente.",
        responses: {
          200: {
            description: "Listado de siniestros abiertos.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SiniestroAbierto" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/neo/vehiculos-asegurados": {
      get: {
        tags: ["Neo4j"],
        summary: "Vehículos asegurados con datos de cliente y póliza",
        description: "Devuelve los vehículos asegurados indicando su patente, el cliente y la póliza.",
        responses: {
          200: {
            description: "Listado de vehículos asegurados.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/VehiculoAsegurado" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    }
  }
};

export default swaggerDocument;
