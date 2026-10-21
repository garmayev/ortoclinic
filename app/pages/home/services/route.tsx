import Button from "~/components/Button";
import {useNavigate} from "react-router";
import {useAppContext} from "~/hooks/AppContext";
import {useEffect, useState} from "react";
import axios from "axios";
import Service from "~/classes/Service.ts";
import {styled} from "styled-components";

const Container = styled.div`
    margin-bottom: 80px;
`

const Card = styled.div`
    border-radius: 5px;
    padding: 10px;
    background: white;
    color: #666;
    display: flex;
    justify-content: start;
    align-items: center;
    margin-bottom: 2vw;
    cursor: pointer;
`

export default () => {
    const navigate = useNavigate();
    const {setTheme, setTitle, setUseOpacity, setBarVisible, loader} = useAppContext()
    const [services, setServices] = useState<Service[]>([])

    useEffect(() => {
        setTheme("static")
        setTitle("Услуги");
        setUseOpacity(true)
        setBarVisible(false)
        
        loader.showFullscreenLoader()
        loader.setShowLoader(true);

        const company_id = localStorage.getItem('company_id');
        const defaultCategory = localStorage.getItem('defaultCategory');
        axios.get(`/api/category/view?id=${defaultCategory}`)
            .then((response) => {
                console.log(response);
                if (response.data) {
                    setServices(response.data.children.map((item: any) => new Service(item)))
                }
            })
            .finally(() => {
                loader.setShowLoader(false);
            })
    }, []);

    return (
        <>
            <Container>
                {services.map((item: Service) =>
                    <Card onClick={() => {
                        navigate(`/home/services/${item.id}`)
                    }}>{item.title}</Card>
                )}
            </Container>
            <Button onClick={() => {
                navigate("/home", {viewTransition: true})
            }} $size={"large"} style={{height: 55, borderRadius: 30, position: 'fixed', bottom: 20, margin: '0 5%', width: '86%'}}>Назад</Button>
        </>
    )
}