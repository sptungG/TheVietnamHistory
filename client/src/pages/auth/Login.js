import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";
import { Form, Input, Button, Layout, Typography, Row, Col, Space, Divider } from "antd";

import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";

import { auth, googleAuthProvider } from "../../common/firebase";
import { createOrUpdateUser } from "../../functions/auth";
import Gallery from "./Gallery";

function Login({ history }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  let dispatch = useDispatch();
  const [form] = Form.useForm();

  const { user } = useSelector((state) => ({ ...state }));

  React.useEffect(() => {
    if (user && user.token) history.push("/");
  }, [history, user]);

  const roleBasedRedirect = (role) => {
    if (role === "admin") {
      history.push("/admin/dashboard");
    } else {
      history.push("/user/history");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      // console.log(result);
      const { user } = result;
      const idTokenResult = await user.getIdTokenResult();

      createOrUpdateUser(idTokenResult.token)
        .then((res) => {
          // console.log("CREATE OR UPDATE RES", res);
          dispatch({
            type: "LOGGED_IN_USER",
            payload: {
              _id: res.data._id,
              name: res.data.name,
              email: res.data.email,
              picture: res.data.picture,
              role: res.data.role,
              token: idTokenResult.token,
            },
          });
          roleBasedRedirect(res.data.role);
        })
        .catch((err) => {
          console.log(err);
        });

      // history.replace("/");
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    auth
      .signInWithPopup(googleAuthProvider)
      .then(async (result) => {
        const { user } = result;
        const idTokenResult = await user.getIdTokenResult();

        createOrUpdateUser(idTokenResult.token)
          .then((res) => {
            // console.log("CREATE OR UPDATE RES", res);
            dispatch({
              type: "LOGGED_IN_USER",
              payload: {
                _id: res.data._id,
                name: res.data.name,
                email: res.data.email,
                picture: res.data.picture,
                role: res.data.role,
                token: idTokenResult.token,
              },
            });
            roleBasedRedirect(res.data.role);
          })
          .catch((err) => {
            console.log(err);
          });

        // history.replace("/");
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const LoginForm = () => {
    return (
      <Form form={form} name="form-container" onFinish={handleSubmit} size="large" layout="vertical" autoComplete>
        {loading ? <Typography.Title>Loading...</Typography.Title> : <Typography.Title>Welcome back</Typography.Title>}
        <Typography.Title level={5} type="secondary">
          Come to the Dashboard
        </Typography.Title>
        <Space align="baseline">
          <span>Login with: </span>
          <Button onClick={googleLogin} size="large">
            <FcGoogle size={24} />
          </Button>
        </Space>
        <Divider plain>Or</Divider>
        <Form.Item>
          <Input prefix={<HiOutlineMail size={24} />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email..." />
        </Form.Item>
        <Form.Item>
          <Input.Password
            prefix={<HiOutlineLockClosed size={24} />}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password..."
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-form-button" style={{ width: "100%" }}>
            Login with Email/Password
          </Button>
          <p style={{ textAlign: "right" }}>
            <Link to="/forgot/password">Forgot Password</Link>
          </p>
        </Form.Item>
      </Form>
    );
  };

  return (
    <Layout.Content>
      <Row gutter={[54, 48]} wrap={false}>
        <Col flex="480px">
          {LoginForm()}
          <p style={{ textAlign: "center" }}>
            Don't have an account? <Link to="/register">Create now</Link>
          </p>
        </Col>
        <Col flex="auto">
          <Gallery />
        </Col>
      </Row>
    </Layout.Content>
  );
}
export default Login;
