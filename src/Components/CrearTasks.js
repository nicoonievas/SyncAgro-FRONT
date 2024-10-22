import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const validateMessages = {
  required: '${label} is required!',
};

const CrearTasks = ({ taskToAdd }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (taskToAdd) {
      form.setFieldsValue({
        nombre: taskToAdd.nombre,
        descripcion: taskToAdd.descripcion,
        resumen: taskToAdd.resumen,
        user: taskToAdd.user,
      });
      setSelectedUser(taskToAdd.user); // Cargar el usuario seleccionado si se está editando
    }
  }, [taskToAdd, form]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get('https://prog-iii-swagger-nievas-nicolas.vercel.app/api/user');
        if (response.data.data && Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else {
          console.error('Data is not in expected format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const onFinish = async (values) => {
    const taskData = {
      name: values.task.name,
      description: values.task.description,
      resume: values.task.resume,
      user: selectedUser?._id, // Usar el ID del usuario seleccionado
    };

    try {
        setLoading(true);
        const response = await axios.post(
          'https://prog-iii-swagger-nievas-nicolas.vercel.app/api/task',
          taskData, // Axios automáticamente convierte el objeto en JSON
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      
        if (response.status !== 200 && response.status !== 201) {
          throw new Error('Error al crear la tarea');
        }
      
        const result = response.data;
        console.log(result);
        form.resetFields();
      } catch (error) {
        console.error('Error al crear la tarea:', error);
      } finally {
        setLoading(false); // Detener loading
      }
  };

  const handleUserSelect = (userId) => {
    const selected = users.find((user) => user._id === userId);
    setSelectedUser(selected);
  };

  return (
    <Form
      {...layout}
      name="crear-tasks"
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
      validateMessages={validateMessages}
    >
      <Form.Item
        name={['task', 'name']}
        label="Nombre de la Tarea"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name={['task', 'description']}
        label="Descripcion de la tarea"
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name={['task', 'resume']}
        label="Resumen de la tarea"
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name="user"
        label="Usuario Seleccionado"
        rules={[{ required: true, message: 'Debe seleccionar un usuario' }]}
      >
        <Select
          showSearch
          placeholder="Buscar usuario"
          optionFilterProp="children"
          onChange={handleUserSelect}
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {users.map((user) => (
            <Option key={user._id} value={user._id}>
              {`${user.lastname} - ${user.documento}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        wrapperCol={{ ...layout.wrapperCol, offset: 8 }}
      >
        <Button type="primary" htmlType="submit" loading={loading}>
          Guardar Tarea
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearTasks;
