import pymysql
from spyne import Application, rpc, ServiceBase, Iterable, Unicode
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication


# Configuración de la conexión a MySQL
def conectar_db():
    return pymysql.connect(
        host="localhost",
        user="root",  
        password="77777", 
        database="profesores_db",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor  
    )


class ProfesorService(ServiceBase):
    @rpc(Unicode, Unicode, Unicode, Unicode, _returns=Unicode)
    def registrar_profesor(ctx, nombre, apellido, dni, materia):
        conexion = conectar_db()
        cursor = conexion.cursor()
        try:
            cursor.execute(
                "INSERT INTO profesores (nombre, apellido, dni, materia) VALUES (%s, %s, %s, %s)",
                (nombre, apellido, dni, materia)
            )
            conexion.commit()
            return f"Profesor {nombre} {apellido} registrado con éxito."
        except pymysql.MySQLError as e:
            return f"Error al registrar profesor: {str(e)}"
        finally:
            cursor.close()
            conexion.close()

    @rpc(Unicode, Unicode, Unicode, Unicode, _returns=Unicode)
    def actualizar_profesor(ctx, dni, nombre, apellido, materia):
        conexion = conectar_db()
        cursor = conexion.cursor()
        try:
            cursor.execute(
                """
                UPDATE profesores
                SET nombre = %s, apellido = %s, materia = %s
                WHERE dni = %s
                """,
                (nombre, apellido, materia, dni)
            )
            conexion.commit()
            if cursor.rowcount > 0:
                return f"Profesor con DNI {dni} actualizado con éxito."
            else:
                return f"Error: No se encontró un profesor con DNI {dni}."
        except pymysql.MySQLError as e:
            return f"Error al actualizar profesor: {str(e)}"
        finally:
            cursor.close()
            conexion.close()

    @rpc(Unicode, _returns=Unicode)
    def buscar_profesor(ctx, dni):
        conexion = conectar_db()
        cursor = conexion.cursor()
        try:
            cursor.execute("SELECT * FROM profesores WHERE dni = %s", (dni,))
            profesor = cursor.fetchone()
            if profesor:
                return (f"Nombre: {profesor['nombre']}, "
                        f"Apellido: {profesor['apellido']}, "
                        f"DNI: {profesor['dni']}, "
                        f"Materia: {profesor['materia']}")
            else:
                return f"Error: No se encontró un profesor con DNI {dni}."
        finally:
            cursor.close()
            conexion.close()

    @rpc(Unicode, _returns=Unicode)
    def eliminar_profesor(ctx, dni):
        conexion = conectar_db()
        cursor = conexion.cursor()
        try:
            cursor.execute("DELETE FROM profesores WHERE dni = %s", (dni,))
            conexion.commit()
            if cursor.rowcount > 0:
                return f"Profesor con DNI {dni} eliminado con éxito."
            else:
                return f"Error: No se encontró un profesor con DNI {dni}."
        finally:
            cursor.close()
            conexion.close()

    @rpc(_returns=Iterable(Unicode))
    def ver_todos_profesores(ctx):
        conexion = conectar_db()
        cursor = conexion.cursor()
        try:
            cursor.execute("SELECT * FROM profesores")
            profesores = cursor.fetchall()
            if not profesores:
                return ["No hay profesores registrados."]
            return [f"Nombre: {profesor['nombre']}, Apellido: {profesor['apellido']}, DNI: {profesor['dni']}, Materia: {profesor['materia']}" for profesor in profesores]
        finally:
            cursor.close()
            conexion.close()


# Configuración de la aplicación SOAP
application = Application(
    [ProfesorService],
    tns='soap.profesor.servicio',
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11()
)



class CORSMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        if environ['REQUEST_METHOD'] == 'OPTIONS':
           
            headers = [
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type'),
            ]
            start_response('200 OK', headers)
            return [b''] 

       
        def custom_start_response(status, headers, exc_info=None):
            headers.append(('Access-Control-Allow-Origin', '*'))
            return start_response(status, headers, exc_info)

        return self.app(environ, custom_start_response)

# Servidor WSGI con soporte para CORS
if __name__ == "__main__":
    from wsgiref.simple_server import make_server

    host = '192.168.18.14'  
    port = 8000

    print(f"Iniciando servidor SOAP en http://{host}:{port}")
    wsgi_app = CORSMiddleware(WsgiApplication(application))
    server = make_server(host, port, wsgi_app)
    server.serve_forever()
