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
      name: "MongoDB",
      description: "Consultas respaldadas por MongoDB"
    },
    {
      name: "Neo4j",
      description: "Consultas respaldadas por Neo4j"
    },
    {
      name: "Operaciones",
      description: "Altas, bajas y modificaciones sobre los datos"
    }
  ],
  components: {
    responses: {
      ServerError: {
        description: "Error inesperado en el servidor.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" }
          }
        }
      },
      BadRequest: {
        description: "La solicitud no cumple con los requisitos mínimos.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" }
          }
        }
      },
      NotFound: {
        description: "No se encontró el recurso solicitado.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" }
          }
        }
      },
      Conflict: {
        description: "El recurso ya existe o entra en conflicto con el estado actual.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" }
          }
        }
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "MISSING_ARGUMENTS" }
        }
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
          nombre: { type: "string", example: "Juan" },
          apellido: { type: "string", example: "Pérez" },
          polizas_vigentes: {
            type: "array",
            items: { $ref: "#/components/schemas/PolizaResumen" }
          }
        }
      },
      ClienteSinPoliza: {
        type: "object",
        properties: {
          nombre: { type: "string", example: "María" },
          apellido: { type: "string", example: "Gómez" }
        }
      },
      PolizaVencida: {
        type: "object",
        properties: {
          nro_poliza: { type: "string", example: "PZ-2002" },
          nombre: { type: "string", example: "Lucía" },
          apellido: { type: "string", example: "Martínez" }
        }
      },
      ClienteCobertura: {
        type: "object",
        properties: {
          nombre: { type: "string", example: "Miguel" },
          apellido: { type: "string", example: "Suárez" },
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
          nombre: { type: "string", example: "Ana" },
          apellido: { type: "string", example: "Lopez" }
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
      },
      PolizaActiva: {
        type: "object",
        properties: {
          nro_poliza: { type: "string", example: "PZ-5001" },
          id_cliente: { type: "string", example: "CLI-01" },
          tipo: { type: "string", example: "Automotor" },
          fecha_inicio: { type: "string", example: "01/01/2024" },
          fecha_fin: { type: "string", example: "01/01/2025" },
          prima_mensual: { type: "number", example: 25000 },
          cobertura_total: { type: "number", example: 1500000 },
          id_agente: { type: "string", example: "AG-10" },
          estado: { type: "string", example: "Activa" }
        }
      },
      ClienteInput: {
        type: "object",
        required: [
          "id_cliente",
          "nombre",
          "apellido",
          "dni",
          "email",
          "telefono",
          "direccion",
          "ciudad",
          "provincia",
          "activo"
        ],
        properties: {
          id_cliente: { type: "string", example: "CLI-100" },
          nombre: { type: "string", example: "Laura" },
          apellido: { type: "string", example: "Rivas" },
          dni: { type: "string", example: "33111222" },
          email: { type: "string", example: "laura@correo.com" },
          telefono: { type: "string", example: "+54 11 4444-5555" },
          direccion: { type: "string", example: "Av. Siempre Viva 123" },
          ciudad: { type: "string", example: "Buenos Aires" },
          provincia: { type: "string", example: "Buenos Aires" },
          activo: { type: "string", description: "Usar 'True' o 'False'", example: "True" }
        }
      },
      ClienteUpdateInput: {
        type: "object",
        description: "Campos a actualizar del cliente. Se puede enviar cualquier subconjunto.",
        properties: {
          nombre: { type: "string" },
          apellido: { type: "string" },
          dni: { type: "string" },
          email: { type: "string" },
          telefono: { type: "string" },
          direccion: { type: "string" },
          ciudad: { type: "string" },
          provincia: { type: "string" },
          activo: { type: "string", example: "False" }
        }
      },
      SiniestroInput: {
        type: "object",
        required: [
          "id_siniestro",
          "nro_poliza",
          "fecha",
          "tipo",
          "monto_estimado",
          "descripcion",
          "estado"
        ],
        properties: {
          id_siniestro: { type: "string", example: "SIN-200" },
          nro_poliza: { type: "string", example: "PZ-5001" },
          fecha: { type: "string", example: "25/05/2024" },
          tipo: { type: "string", example: "Accidente" },
          monto_estimado: { type: "number", example: 320000 },
          descripcion: { type: "string", example: "Colisión en autopista" },
          estado: { type: "string", example: "Abierto" }
        }
      },
      PolizaInput: {
        type: "object",
        required: [
          "nro_poliza",
          "id_cliente",
          "tipo",
          "fecha_inicio",
          "fecha_fin",
          "prima_mensual",
          "cobertura_total",
          "id_agente",
          "estado"
        ],
        properties: {
          nro_poliza: { type: "string", example: "PZ-7001" },
          id_cliente: { type: "string", example: "CLI-25" },
          tipo: { type: "string", example: "Hogar" },
          fecha_inicio: { type: "string", example: "10/03/2024" },
          fecha_fin: { type: "string", example: "10/03/2025" },
          prima_mensual: { type: "number", example: 18000 },
          cobertura_total: { type: "number", example: 5000000 },
          id_agente: { type: "string", example: "AG-05" },
          estado: { type: "string", example: "Activa" }
        }
      },
      OperacionResultado: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          mongo: { type: "object", description: "Respuesta devuelta por MongoDB" },
          neo: { type: "object", description: "Respuesta devuelta por Neo4j" }
        }
      }
    }
  },
  paths: {
    "/queries/query1": {
      get: {
        tags: ["MongoDB"],
        summary: "Query 1 - Clientes con pólizas vigentes",
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
    "/queries/query2": {
      get: {
        tags: ["Neo4j"],
        summary: "Query 2 - Siniestros abiertos por cliente",
        description: "Lista los siniestros abiertos mostrando tipo, monto y los datos del cliente afectado.",
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
    "/queries/query3": {
      get: {
        tags: ["Neo4j"],
        summary: "Query 3 - Vehículos asegurados",
        description: "Devuelve los vehículos asegurados indicando su patente, el cliente y la póliza asociada.",
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
    },
    "/queries/query4": {
      get: {
        tags: ["MongoDB"],
        summary: "Query 4 - Clientes sin pólizas activas",
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
    "/queries/query5": {
      get: {
        tags: ["Neo4j"],
        summary: "Query 5 - Agentes con pólizas emitidas",
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
    "/queries/query6": {
      get: {
        tags: ["MongoDB"],
        summary: "Query 6 - Pólizas vencidas",
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
    "/queries/query7": {
      get: {
        tags: ["MongoDB"],
        summary: "Query 7 - Top clientes por cobertura",
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
    "/queries/query8": {
      get: {
        tags: ["MongoDB"],
        summary: "Query 8 - Siniestros por accidente del último año",
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
    "/queries/query9": {
      get: {
        tags: ["MongoDB"],
        summary: "Query 9 - Vista de pólizas activas",
        description: "Consulta la vista materializada ordenada por fecha de inicio con las pólizas activas.",
        responses: {
          200: {
            description: "Listado de pólizas activas.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PolizaActiva" }
                }
              }
            }
          },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/queries/query10": {
      get: {
        tags: ["MongoDB"],
        summary: "Query 10 - Pólizas suspendidas",
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
    "/queries/query11": {
      get: {
        tags: ["Neo4j"],
        summary: "Query 11 - Clientes con múltiples vehículos",
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
    "/queries/query12": {
      get: {
        tags: ["Neo4j"],
        summary: "Query 12 - Agentes y siniestros asociados",
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
    "/queries/crear-cliente": {
      post: {
        tags: ["Operaciones"],
        summary: "Crear un nuevo cliente (Query 13)",
        description: "Inserta un cliente tanto en MongoDB como en Neo4j asegurando consistencia entre orígenes.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClienteInput" }
            }
          }
        },
        responses: {
          201: {
            description: "Cliente creado correctamente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OperacionResultado" }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/queries/modificar-cliente/{id}": {
      put: {
        tags: ["Operaciones"],
        summary: "Modificar un cliente existente (Query 13)",
        description: "Actualiza los datos de un cliente por su id en ambas bases.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Identificador del cliente (id_cliente)."
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClienteUpdateInput" }
            }
          }
        },
        responses: {
          200: {
            description: "Cliente actualizado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OperacionResultado" }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/queries/borrar-cliente/{id}": {
      delete: {
        tags: ["Operaciones"],
        summary: "Eliminar un cliente (Query 13)",
        description: "Elimina un cliente de ambas bases en caso de existir.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Identificador del cliente (id_cliente)."
          }
        ],
        responses: {
          200: {
            description: "Cliente eliminado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OperacionResultado" }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/queries/crear-siniestro": {
      post: {
        tags: ["Operaciones"],
        summary: "Crear un siniestro (Query 14)",
        description:
          "Registra un nuevo siniestro vinculado a una póliza existente. Se escribe primero en MongoDB y luego en Neo4j.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SiniestroInput" }
            }
          }
        },
        responses: {
          201: {
            description: "Siniestro creado correctamente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OperacionResultado" }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    },
    "/queries/crear-poliza": {
      post: {
        tags: ["Operaciones"],
        summary: "Crear una póliza (Query 15)",
        description:
          "Emite una nueva póliza luego de validar la existencia del cliente y del agente en ambas bases de datos.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PolizaInput" }
            }
          }
        },
        responses: {
          201: {
            description: "Póliza creada correctamente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OperacionResultado" }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/ServerError" }
        }
      }
    }
  }
};

export default swaggerDocument;
