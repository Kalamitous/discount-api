import React, { useState, useLayoutEffect } from 'react'
import { Link } from "react-router-dom"
import { Card, Button, Input, InputNumber, Statistic, Row, Col } from 'antd';
import { EditOutlined, ReloadOutlined, SwapOutlined } from '@ant-design/icons'
import axios from 'axios'
import 'antd/dist/antd.css'

const AdminView = () => (
    <div>
        <Row type="flex" align="middle" className="header">
            <Col span={12}>
                <h1>Admin View</h1>
            </Col>
            <Col span={12}>
                <Link to="/customer">
                    <Button icon={<SwapOutlined />}>Swap View</Button>
                </Link>
            </Col>
        </Row>
        <Row gutter={[16, 16]}>
            <Col span={24}>
                <Report />
            </Col>
        </Row>
        <Row gutter={[16, 16]}>
            <Col span={12}>
                <DiscountInterval />
            </Col>
            <Col span={12}>
                <DiscountCode />
            </Col>
        </Row>
    </div>
)

const Report = () => {
    const [transactionCount, setTransactionCount] = useState(0)
    const [discountCount, setDiscountCount] = useState(0)

    useLayoutEffect(() => {
        updateValues()
    }, [])

    const updateValues = () => {
        axios.get("http://localhost:8080/user/admin/report")
        .then(resp => {
            setTransactionCount(resp.data.transactionCount)
            setDiscountCount(resp.data.discountCount)
        })
        .catch(err => console.error(err))
    }

    return (
        <Card title="Store Report">
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Statistic title="Total Transactions" value={transactionCount}/>
                </Col>
                <Col span={12}>
                    <Statistic title="Discounts Given" value={discountCount}/>
                </Col>
            </Row>
            <Row>
                <Button
                    icon={<ReloadOutlined />}
                    type="primary"
                    onClick={updateValues}
                >
                    Refresh
                </Button>
            </Row>
        </Card>
    )
}

const DiscountInterval = () => {
    const [interval, setInterval] = useState(0)

    useLayoutEffect(() => {
        updateInterval()
    }, [])

    const updateInterval = () => {
        axios.get("http://localhost:8080/user/admin/interval")
        .then(resp => {
            setInterval(resp.data)
        })
        .catch(err => console.error(err))
    }

    const onInputChange = (val) => {
        setInterval(val)
    }

    const onButtonClick = () => {
        // Restore the original interval when the user submits an empty input.
        if (!interval) {
            updateInterval()
            return
        }
        axios.post("http://localhost:8080/user/admin/interval?n=" + interval)
        .catch(err => console.error(err))
    }

    return (
        <Card title="Discount Interval">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <InputNumber
                        value={interval}
                        min={1}
                        onChange={onInputChange}
                    />
                </Col>
            </Row>
            <Row>
                <Button
                    icon={<EditOutlined />}
                    type="primary"
                    onClick={onButtonClick}
                >
                    Apply
                </Button>
            </Row>
        </Card>
    )
}

const DiscountCode = () => {
    const [code, setCode] = useState("")

    useLayoutEffect(() => {
        updateDiscount()
    }, [])

    const updateDiscount = () => {
        axios.get("http://localhost:8080/user/admin/discount")
        .then(resp => {
            setCode(resp.data)
        })
        .catch(err => console.error(err))
    }

    const onInputChange = (e) => {
        setCode(e.target.value)
    }

    const onButtonClick = () => {
        // Restore the original discount code when the user submits an empty input.
        if (code === "") {
            updateDiscount()
            return
        }
        axios.post("http://localhost:8080/user/admin/discount?code=" + code)
        .catch(err => console.error(err))
    }

    return (
        <Card title="Discount Code">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Input
                        value={code}
                        onChange={onInputChange}
                        allowClear
                    />
                </Col>
            </Row>
            <Row>
                <Button
                    icon={<EditOutlined />}
                    type="primary"
                    onClick={onButtonClick}
                >
                    Apply
                </Button>
            </Row>
        </Card>
    )
}

export default AdminView
