import { Neo4jError } from "neo4j-driver";
import {
    crearCliente as mongoCrearCliente,
    actualizarCliente as mongoActualizarCliente,
    eliminarCliente as mongoEliminarCliente,
    crearSiniestro as mongoCrearSiniestro,
    crearPoliza as mongoCrearPoliza,
    mongoFindAgente,
    mongoFindCliente,
    mongoEliminarSiniestro,
    mongoEliminarPoliza
} from "./../mongo/queries.js";
import {
    crearCliente as neoCrearCliente,
    actualizarCliente as neoActualizarCliente,
    eliminarCliente as neoEliminarCliente,
    crearSiniestro as neoCrearSiniestro,
    crearPoliza as neoCrearPoliza,
    neoFindAgente,
    neoFindCliente
} from "./../neo/queries.js";

export const MISSING_ARGUMENTS = -1;
export const ALREADY_EXISTS = -2;
export const NOT_FOUND = -3;

export async function crearCliente(nuevoCliente) {
    if (!nuevoCliente || !nuevoCliente.id_cliente || !nuevoCliente.nombre || !nuevoCliente.apellido 
        || !nuevoCliente.dni || !nuevoCliente.email || !nuevoCliente.telefono || !nuevoCliente.direccion 
        || !nuevoCliente.ciudad || !nuevoCliente.provincia || !nuevoCliente.activo) {
        throw new Error("MISSING_ARGUMENTS");
    }

    try {
        // inserto en mongo primero
        const mongoRes = await mongoCrearCliente(nuevoCliente);
        if (mongoRes === ALREADY_EXISTS) {
            return mongoRes; // falla
        }

        // mongo ok, inserto en neo
        const neoRes = await neoCrearCliente(nuevoCliente);
        if (neoRes === ALREADY_EXISTS) {
            await mongoEliminarCliente(nuevoCliente.id_cliente); // falla neo, deshago mongo
            return neoRes;
        }
        return { success: true, neo: neoRes, mongo: mongoRes };
    } catch (error) {
        console.error('Error creating client:', error);
        throw error;
    }
}

// TODO: esto es asumiendo que ninguno falla, ver como hacemos
// regla de consistencia: si no esta en ambos no esta, es eventualmente consistente 
export async function actualizarCliente(id_cliente, datosActualizados) {
    if (!id_cliente || !datosActualizados || Object.keys(datosActualizados).length === 0) {
        throw new Error("MISSING_ARGUMENTS");
    }

    if (!(await mongoFindCliente(id_cliente)) || !(await neoFindCliente(id_cliente))) {
        return NOT_FOUND;
    }

    const neoRes = await neoActualizarCliente(id_cliente, datosActualizados);
    const mongoRes = await mongoActualizarCliente(id_cliente, datosActualizados);

    return { success: true, neo: neoRes, mongo: mongoRes };
}

// TODO: esto es asumiendo que ninguno falla, ver como hacemos
// regla de consistencia: si no esta en ambos no esta, es eventualmente consistente 
export async function eliminarCliente(id_cliente) {
    if (!id_cliente) throw new Error("MISSING_ARGUMENTS");

    if (!(await mongoFindCliente(id_cliente)) || !(await neoFindCliente(id_cliente))) {
        return NOT_FOUND;
    }

    const mongoRes = await mongoEliminarCliente(id_cliente);
    const neoRes = await neoEliminarCliente(id_cliente);

    return { success: true, mongo: mongoRes, neo: neoRes };
}

export async function crearSiniestro(nuevoSiniestro) {
    if (!nuevoSiniestro || !nuevoSiniestro.id_siniestro || !nuevoSiniestro.nro_poliza 
        || !nuevoSiniestro.fecha || !nuevoSiniestro.tipo || !nuevoSiniestro.monto_estimado 
        || !nuevoSiniestro.descripcion || !nuevoSiniestro.estado) {
        throw new Error("MISSING_ARGUMENTS");
    }

    try {
        // primero en mongo
        const mongoRes = await mongoCrearSiniestro(nuevoSiniestro);
        if (mongoRes === ALREADY_EXISTS) {
            return mongoRes; // falla
        }

        // funciono mongo, pruebo neo
        const neoRes = await neoCrearSiniestro(nuevoSiniestro);
        if ( neoRes === ALREADY_EXISTS) {
            await mongoEliminarSiniestro(nuevoSiniestro.id_siniestro); // rollback manual en mongo
            return NOT_FOUND;
        }

        return { success: true, neo: neoRes, mongo: mongoRes };
    } catch (error) {
        console.error('Error creating claim:', error);
        throw error;
    }
}

export async function crearPoliza(nuevaPoliza) {
    if (!nuevaPoliza || !nuevaPoliza.nro_poliza || !nuevaPoliza.id_cliente 
        || !nuevaPoliza.tipo || !nuevaPoliza.fecha_inicio || !nuevaPoliza.fecha_fin 
        || !nuevaPoliza.prima_mensual || !nuevaPoliza.cobertura_total 
        || !nuevaPoliza.id_agente || !nuevaPoliza.estado) {
        throw new Error("MISSING_ARGUMENTS");
    }

    try {
        if (!await mongoFindCliente(nuevaPoliza.id_cliente) 
            || !await mongoFindAgente(nuevaPoliza.id_agente) 
        || !await neoFindCliente(nuevaPoliza.id_cliente) 
        || !await neoFindAgente(nuevaPoliza.id_agente)) {
            return NOT_FOUND;
        }
        
        // primero pruebo en mongo
        const mongoRes = await mongoCrearPoliza(nuevaPoliza);
        if (mongoRes === ALREADY_EXISTS) {
            return mongoRes; // fallo
        }

        // ok mongo, vamos con neo
        const neoRes = await neoCrearPoliza(nuevaPoliza);
        if (neoRes === ALREADY_EXISTS) {
            await mongoEliminarPoliza(nuevaPoliza.nro_poliza); // rollback manual en mongo
            return neoRes;
        }

        return { success: true, neo: neoRes, mongo: mongoRes };
    } catch (error) {
        console.error('Error creating policy:', error);
        throw error;
    }
}