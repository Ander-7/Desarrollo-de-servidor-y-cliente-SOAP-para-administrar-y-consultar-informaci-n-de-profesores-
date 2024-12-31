  // Función para registrar un profesor
  document.getElementById('formRegistrar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const dni = document.getElementById('dni').value;
    const materia = document.getElementById('materia').value;

    const response = await fetch('http://192.168.18.14:8000', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="soap.profesor.servicio">
          <soapenv:Header/>
          <soapenv:Body>
            <ser:registrar_profesor>
              <ser:nombre>${nombre}</ser:nombre>
              <ser:apellido>${apellido}</ser:apellido>
              <ser:dni>${dni}</ser:dni>
              <ser:materia>${materia}</ser:materia>
            </ser:registrar_profesor>
          </soapenv:Body>
        </soapenv:Envelope>
      `
    });

    if (response.ok) {
      alert('Profesor registrado exitosamente');
      document.getElementById('formRegistrar').reset();
      cargarProfesores();
    } else {
      alert('Error al registrar profesor');
    }
  });

  // Función para cargar los profesores
  async function cargarProfesores() {
    try {
      const SOAP_URL = 'http://192.168.18.14:8000'; 

      const response = await fetch(SOAP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: `
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="soap.profesor.servicio">
            <soapenv:Header/>
            <soapenv:Body>
              <ser:ver_todos_profesores/>
            </soapenv:Body>
          </soapenv:Envelope>
        `
      });

      const textResponse = await response.text();
      console.log("Respuesta del servidor SOAP:", textResponse);

     
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(textResponse, 'text/xml');

      
      const profesores = xmlDoc.getElementsByTagName('tns:string');
      console.log("Profesores encontrados:", profesores.length);

      
      const listaProfesores = document.getElementById('listaProfesores');
      listaProfesores.innerHTML = ''; 

      
      if (profesores.length === 0) {
        listaProfesores.innerHTML = '<tr><td colspan="5">No se encontraron profesores.</td></tr>';
        return;
      }

     
      Array.from(profesores).forEach((profesorXML) => {
        const datos = profesorXML.textContent.split(', ');

        
        const nombre = datos[0].split(': ')[1];
        const apellido = datos[1].split(': ')[1];
        const dni = datos[2].split(': ')[1];
        const materia = datos[3].split(': ')[1];

        
        const row = `
          <tr>
            <td>${nombre}</td>
            <td>${apellido}</td>
            <td>${dni}</td>
            <td>${materia}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="actualizarProfesor('${nombre}', '${apellido}', '${dni}', '${materia}')">Actualizar</button>
              <button class="btn btn-danger btn-sm" onclick="eliminarProfesor('${dni}')">Eliminar</button>
            </td>
          </tr>
        `;
        listaProfesores.innerHTML += row;
      });
    } catch (error) {
      console.error('Error al cargar los profesores:', error);
      alert('Hubo un error al cargar los profesores.');
    }
  }

  // Función para mostrar el formulario de actualización
  function actualizarProfesor(nombre, apellido, dni, materia) {
    document.getElementById('nombreActualizar').value = decodeURIComponent(nombre);
    document.getElementById('apellidoActualizar').value = decodeURIComponent(apellido);
    document.getElementById('dniActualizar').value = decodeURIComponent(dni);
    document.getElementById('materiaActualizar').value = decodeURIComponent(materia);

    document.getElementById('formularioActualizar').style.display = 'block';
  }

  // Función para actualizar un profesor
  document.getElementById('formActualizar').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombreActualizar').value;
    const apellido = document.getElementById('apellidoActualizar').value;
    const dni = document.getElementById('dniActualizar').value;
    const materia = document.getElementById('materiaActualizar').value;

    try {
      const response = await fetch('http://192.168.18.14:8000', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: `
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="soap.profesor.servicio">
            <soapenv:Header/>
            <soapenv:Body>
              <ser:actualizar_profesor>
                <ser:dni>${dni}</ser:dni>
                <ser:nombre>${nombre}</ser:nombre>
                <ser:apellido>${apellido}</ser:apellido>
                <ser:materia>${materia}</ser:materia>
              </ser:actualizar_profesor>
            </soapenv:Body>
          </soapenv:Envelope>
        `
      });

      if (response.ok) {
        alert('Profesor actualizado exitosamente');
        document.getElementById('formularioActualizar').style.display = 'none';
        cargarProfesores();
      } else {
        alert('Error al actualizar profesor');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      alert('Error al conectar con el servidor');
    }
  });

  // Función para eliminar un profesor
  async function eliminarProfesor(dni) {
    if (confirm(`¿Estás seguro de eliminar al profesor con DNI: ${dni}?`)) {
      const response = await fetch('http://192.168.18.14:8000', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: `
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="soap.profesor.servicio">
            <soapenv:Header/>
            <soapenv:Body>
              <ser:eliminar_profesor>
                <ser:dni>${dni}</ser:dni>
              </ser:eliminar_profesor>
            </soapenv:Body>
          </soapenv:Envelope>
        `
      });

      if (response.ok) {
        alert('Profesor eliminado exitosamente');
        cargarProfesores();
      } else {
        alert('Error al eliminar profesor');
      }
    }
  }
