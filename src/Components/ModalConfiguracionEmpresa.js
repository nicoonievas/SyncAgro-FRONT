import React, { useState } from 'react';
import { Modal, Form, Input, Button, TimePicker, notification, Checkbox } from 'antd';
import axios from 'axios';

const ModalConfiguracionEmpresa = ({ visible, onClose, empresa }) => {
  const [form] = Form.useForm();  // Creamos el formulario
  const [loading, setLoading] = useState(false);


  const handleSave = async (values) => {
    const empresaId = empresa._id;
    setLoading(true);
    try {
      // Se divide los correos en un array antes de enviar
      const correctedValues = {
        ...values,
        correosRecepcionNotificacion: values.correosRecepcionNotificacion.split(',').map(email => email.trim()),
        roles: values.roles.split(',').map(role => role.trim())
      };

      // Enviar datos del formulario al backend
      const response = await axios.put(`http://localhost:6001/api/empresa/configuracion/${empresaId}`, correctedValues);
      if (response.status === 200) {
        notification.success({
          message: 'Configuraciones actualizadas',
          description: 'Las configuraciones de la empresa se actualizaron correctamente.'
        });
        onClose();  // Cerrar la modal después de guardar
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Hubo un problema al actualizar las configuraciones de la empresa.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Configuraciones de Empresass"
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        onFinish={handleSave}  // Llamada a la función de guardado
        layout="vertical"
      >
        <Form.Item
          name="roles"
          label="Roles"
          rules={[{ required: true, message: 'Por favor, ingresa los roles de la empresa.' }]}
        >
          <Input.TextArea rows={2} placeholder="Ingresa los roles separados por comas" />
        </Form.Item>

        <Form.Item
          name="correosRecepcionNotificacion"
          label="Correos de Recepción de Notificaciones"
          rules={[{ required: true, message: 'Por favor, ingresa los correos para la recepción de notificaciones.' }]}
        >
          <Input.TextArea rows={2} placeholder="Ingresa los correos separados por comas" />
        </Form.Item>

        <Form.Item
          name="horarioNotificacion"
          label="Horario de Notificación"
          rules={[{ required: true, message: 'Por favor, selecciona el horario de notificación.' }]}
        >
          <TimePicker format="HH:mm" />
        </Form.Item>

        <Form.Item
  name="diasAlertaVencimientos"
  label="Cantidad de Dias para Alerta"
  rules={[{ required: true, message: 'Por favor, selecciona la cantidad de días.' }]}
  style={{ width: '50%' }}  // Limita el ancho
>
  <Input type="number" placeholder="Cantidad de días" />
</Form.Item>

<Form.Item
  name="diasRecordatorioVencimientos"
  label="Cantidad de Dias para Recordatorio"
  rules={[{ required: true, message: 'Por favor, selecciona la cantidad de días.' }]}
  style={{ width: '50%' }}  // Limita el ancho
>
  <Input type="number" placeholder="Cantidad de días" />
</Form.Item>


        <Form.Item
          name="correoEnvioNotificacion"
          label="Correo de Envío de Notificación"
          rules={[{ required: true, message: 'Por favor, ingresa el correo de envío de notificaciones.' }]}
        >
          <Input type="email" placeholder="Correo de envío de notificación" />
        </Form.Item>

        <Form.Item
          name="contrasenaCorreoEnvioNotificacion"
          label="Contraseña de Correo de Envío"
          rules={[{ required: true, message: 'Por favor, ingresa la contraseña del correo de envío.' }]}
        >
          <Input.Password placeholder="Contraseña de correo" />
        </Form.Item>

        <Form.Item
          name="urlSistemaProveedor"
          label="URL del Sistema del Proveedor"
          rules={[{ required: true, message: 'Por favor, ingresa la URL del sistema del proveedor.' }]}
        >
          <Input placeholder="URL del sistema del proveedor" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Guardar Configuración
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalConfiguracionEmpresa;
