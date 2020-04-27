import React, { useState, useLayoutEffect } from 'react'
import { Link } from "react-router-dom"
import { Card, Button, Input, Modal, Alert, Row, Col } from 'antd';
import { ShoppingCartOutlined, SwapOutlined } from '@ant-design/icons'
import axios from 'axios'
import 'antd/dist/antd.css'

const CustomerView = () => {
    const items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"]
    const [discount, setDiscount] = useState("")

    useLayoutEffect(() => {
		checkDiscount()
	}, [])

    const checkDiscount = () => {
        axios.get("http://localhost:8080/user/customer/discount")
		.then(resp => {
            setDiscount(resp.data)
		})
		.catch(err => console.error(err))
    }

    // Initialize store item components.
    const itemComponents = items.map(item => (
        <Col key={item} span={8}>
            <Item title={item} checkDiscount={checkDiscount} />
        </Col>
    ))

    return (
        <div>
            <Row type="flex" align="middle" className="header">
                <Col span={12}>
                    <h1>Customer View</h1>
                </Col>
                <Col span={12}>
                    <Link to="/admin">
                        <Button icon={<SwapOutlined />}>Swap View</Button>
                    </Link>
                </Col>
            </Row>
            {discount !== "" ?
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Alert
                            message={"Congratulations! You have received a discount! Code: " + discount}
                            type="success"
                        /> 
                    </Col>
                </Row> :
                null}
            <Row gutter={[16, 16]}>
                {itemComponents}
            </Row>
        </div>
    )
}

const Item = props => {
    const title = props.title
    const checkDiscount = props.checkDiscount

    const [visible, setVisible] = useState(false)

    const toggleModal = () => {
        setVisible(!visible)
    }

    return (
        <div>
            <Card cover={<div className="placeholder" />}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card.Meta title={title} description="Item description" />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Button
                            icon={<ShoppingCartOutlined />}
                            type="primary"
                            onClick={toggleModal}
                        >
                        Checkout
                        </Button>
                    </Col>
                </Row>
            </Card>
            <CheckoutModal
                title={title}
                visible={visible}
                toggleModal={toggleModal}
                checkDiscount={checkDiscount}
            />
        </div>
    )
}

const CheckoutModal = props => {
    const title = props.title
    const visible = props.visible
    const toggleModal = props.toggleModal
    const checkDiscount = props.checkDiscount

    const [alert, setAlert] = useState("")
    const [code, setCode] = useState("")

    const resetModal = () => {
        setAlert("")
        setCode("")
    }

    // Closes the modal and check for a discount after a purchase.
    const onModalOk = () => {
        axios.post("http://localhost:8080/user/customer/purchase?code=" + code)
        .then(() => {
            toggleModal()
            checkDiscount()
        })
        .catch(err => console.error(err))
    }

    const onInputChange = (e) => {
		setCode(e.target.value)
    }

    // Verifies whether the user inputted the correct discount code.
    const onButtonClick = () => {
        axios.get("http://localhost:8080/user/customer/discount")
		.then(resp => {
            if (code !== "") {
                if (resp.data === code) {
                    setAlert("success")
                } else {
                    setAlert("error")
                }
            }
		})
		.catch(err => console.error(err))
    }
    
    return (
        <Modal
            title="Checkout"
            visible={visible}
            okText="Purchase"
            onOk={onModalOk}
            onCancel={toggleModal}
            afterClose={resetModal}
        >
            <p>{"Are you sure you want to purchase " + title + "?"}</p>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Input.Search
                        placeholder="Discount code"
                        value={code}
                        enterButton="Apply"
                        onSearch={onButtonClick}
                        onChange={onInputChange}
                        allowClear
                    />
                </Col>
            </Row>
            {alert === "success" ?
                <Alert message="Discount applied successfully!" type="success" /> :
                null
            }
            {alert === "error" ?
                <Alert message="Incorrect discount code." type="error" /> :
                null
            }
        </Modal>
    )
}

export default CustomerView
