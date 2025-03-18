import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, TimePicker, notification } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';

const ModalConfiguracionEmpresa = ({ visible, onClose, empresa }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Cargar datos cuando cambia la empresa seleccionada
  useEffect(() => {
    if (empresa) {
      form.setFieldsValue({
        roles: empresa.roles ? empresa.roles.join(', ') : '',
        correosRecepcionNotificacion: empresa.correosRecepcionNotificacion
          ? empresa.correosRecepcionNotificacion.join(', ')
          : '',
        horarioNotificacion: empresa.horarioNotificacion
          ? dayjs(empresa.horarioNotificacion, "HH:mm")
          : null,
        diasAlertaVencimientos: empresa.diasAlertaVencimientos || '',
        diasRecordatorioVencimientos: empresa.diasRecordatorioVencimientos || '',
        correoEnvioNotificacion: empresa.correoEnvioNotificacion || '',
        contrasenaCorreoEnvioNotificacion: empresa.contrasenaCorreoEnvioNotificacion || '',
        urlSistemaProveedor: empresa.urlSistemaProveedor || ''
      });
    }
  }, [empresa, form]);

  const handleSave = async (values) => {
    const empresaId = empresa._id;
    setLoading(true);
    try {
      const correctedValues = {
        ...values,
        horarioNotificacion: values.horarioNotificacion
          ? dayjs(values.horarioNotificacion).format('HH:mm')
          : null,

        correosRecepcionNotificacion: values.correosRecepcionNotificacion.split(',').map(email => email.trim()),
        roles: values.roles.split(',').map(role => role.trim())
      };

      const response = await axios.put(
        `http://localhost:6001/api/empresa/configuracion/${empresaId}`,
        correctedValues
      );

      if (response.status === 200) {
        notification.success({
          message: 'Configuraciones actualizadas',
          description: 'Las configuraciones de la empresa se actualizaron correctamente.'
        });
        onClose();
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
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        onFinish={handleSave}
        layout="vertical"
      >
        <h3 style={{ textAlign: 'center' }}>Configuraciones de {empresa?.razonSocial}</h3>

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
          <TimePicker
            format="HH:mm"
            onChange={(time) => form.setFieldsValue({ horarioNotificacion: time })}
          />
        </Form.Item>


        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="diasAlertaVencimientos"
            label="Cantidad de Días para Alerta"
            rules={[{ required: true, message: 'Por favor, ingresa la cantidad de días.' }]}
            style={{ flex: 1 }} // Permite que los elementos se ajusten al espacio disponible
          >
            <Input type="number" placeholder="Cantidad de días" />
          </Form.Item>

          <Form.Item
            name="diasRecordatorioVencimientos"
            label="Cantidad de Días para Recordatorio"
            rules={[{ required: true, message: 'Por favor, ingresa la cantidad de días.' }]}
            style={{ flex: 1 }}
          >
            <Input type="number" placeholder="Cantidad de días" />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="correoEnvioNotificacion"
            label="Correo de Envío de Notificación"
            rules={[{ required: true, message: 'Por favor, ingresa el correo de envío de notificaciones.' }]}
            style={{ flex: 1 }}
          >
            <Input type="email" placeholder="Correo de envío de notificación" />
          </Form.Item>

          <Form.Item
            name="contrasenaCorreoEnvioNotificacion"
            label="Contraseña de Aplicación"
            rules={[{ required: true, message: 'Por favor, ingresa la contraseña del correo de envío.' }]}
            style={{ flex: 1 }}
          >
            <Input.Password placeholder="Contraseña de Aplicación" />
          </Form.Item>
        </div>

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
