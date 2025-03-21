import React, { useState } from "react";
import { Modal, Button, notification, Input, DatePicker, Form, Select, Row, Col } from "antd";
import axios from "axios";
import useAxiosInterceptor from "../../utils/axiosConfig";
import dayjs from "dayjs";

const { Option } = Select;

const FinishModal = ({ visible, onClose, onUpdate, laboreo }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const api = useAxiosInterceptor();

  const handleFinish = async (values) => {
    console.log("Finalizando laboreo:", values);
    const idLaboreo = laboreo._id;  // Usamos el ID del `record` completo

    // Convertir las fechas a formato timestamp (en milisegundos)
    if (values.fechaInicio) {
      values.fechaInicio = dayjs(values.fechaInicio).valueOf();  // Convirtiendo a timestamp
    }
    if (values.fechaFin) {
      values.fechaFin = dayjs(values.fechaFin).valueOf();  // Convirtiendo a timestamp
    }
    if (values.fechaCierre) {
      values.fechaCierre = dayjs(values.fechaCierre).valueOf();  // Convirtiendo a timestamp
    }
    setLoading(true);
    try {
      // await api.put(`/laboreos/${idLaboreo}/finish`, values);
      await api.patch(`/laboreo/${idLaboreo}/close`, values);
      
      onUpdate();
      onClose();
      notification.success({ message: 'Laboreo Cerrado', description: 'El laboreo ha sido cerrado exitosamente.' });
    } catch (error) {
      console.error("Error al finalizar el laboreo", error);
      notification.error({ message: 'Error', description: 'Hubo un problema al finalizar el laboreo.' });
    } finally {
      setLoading(false);
    }
  };

  // Obtener todos los empleados (del laboreo + de los equipos)
  const todosLosEmpleados = [
    ...(laboreo?.empleados || []),
    ...(laboreo?.equipos?.flatMap((equipo) => equipo.empleados) || [])
  ];

  return (
    <Modal title="Finalizar Laboreo" open={visible} onCancel={onClose} footer={null}>
      <Form form={form} onFinish={handleFinish} layout="vertical"
        initialValues={{
          fechaInicio: laboreo?.fechaInicio ? dayjs(laboreo.fechaInicio) : null,
          fechaFin: laboreo?.fechaFin ? dayjs(laboreo.fechaFin) : null,
          fechaCierre: laboreo?.fechaCierre ? dayjs(laboreo.fechaCierre) : null
        }}
      >
        {/* Fecha de inicio, fin y cierre */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="fechaInicio" label="Fecha de Inicio" rules={[{ required: true, message: "Seleccione una fecha" }]}>
              <DatePicker format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fechaFin" label="Fecha de Fin" rules={[{ required: true, message: "Seleccione una fecha" }]}>
              <DatePicker format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fechaCierre" label="Fecha de Cierre" rules={[{ required: true, message: "Seleccione una fecha" }]}>
              <DatePicker format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
        </Row>

        {/* Sueldos de empleados */}
        <Form.List name="sueldos">
          {(fields, { add, remove }) => (
            <>
              <h3>Sueldos</h3>
              {todosLosEmpleados.map((empleado, index) => (
                <Form.Item key={empleado._id} label={`${empleado.firstname} ${empleado.lastname}`}>
                  <Form.Item
                    name={[index, "monto"]}
                    rules={[{ required: true, message: "Ingrese un sueldo" }]}
                    noStyle
                  >
                    <Input type="number" prefix="$" placeholder="Sueldo" />
                  </Form.Item>
                  <Form.Item name={[index, "empleadoId"]} initialValue={empleado._id} hidden>
                    <Input />
                  </Form.Item>
                </Form.Item>
              ))}
            </>
          )}
        </Form.List>

        {/* Gastos dinámicos */}
        <Form.List name="gastos">
          {(fields, { add, remove }) => (
            <>
              <h3>Gastos</h3>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <Form.Item {...restField} name={[name, "tipo"]} rules={[{ required: true, message: "Seleccione un tipo de gasto" }]}>
                    <Select placeholder="Tipo de gasto">
                      <Option value="Combustible">Combustible</Option>
                      <Option value="Comida">Comida</Option>
                      <Option value="Reparaciones">Reparaciones</Option>
                      <Option value="Otros">Otros</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "monto"]} rules={[{ required: true, message: "Ingrese el monto" }]}>
                    <Input type="number" prefix="$" placeholder="Monto" />
                  </Form.Item>
                  <Button onClick={() => remove(name)} danger>X</Button>
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} block>+ Agregar Gasto</Button>
            </>
          )}
        </Form.List>

        {/* Cobro al cliente */}
        <Form.List name="cobros">
          {(fields, { add, remove }) => (
            <>
              <h3>Cobros</h3>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <Form.Item {...restField} name={[name, "monto"]} rules={[{ required: true, message: "Ingrese el monto" }]}>
                    <Input type="number" prefix="$" placeholder="Monto" />
                  </Form.Item>
                  <Button onClick={() => remove(name)} danger>X</Button>
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} block>+ Agregar Cobro</Button>
            </>
          )}
        </Form.List>

        {/* Botones */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Finalizar</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FinishModal;
