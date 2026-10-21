import Button from "~/components/Button";
import { useNavigate } from "react-router";
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {useAppContext} from "~/hooks/AppContext";
import {styled} from "styled-components";
import {Helper} from "~/constant/Helper.ts";
import {SelectList} from "~/components/SelectList.tsx";

export default () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const [category, setCategory] = useState<Category>();
    const [services, setServices] = useState<Service[]>([])
    const {setTitle, loader} = useAppContext();
    
    useEffect(() => {
        loader.showFullscreenLoader()
        loader.setShowLoader(true);
        axios.get(`/api/category/view?id=${id}`)
            .then(response => {
                if (response.status === 200) {
                    setCategory(response.data);
                    setTitle(response.data.title);
                }
            }) 
            .finally(() => {
                loader.setShowLoader(false);
            })
    }, [id]);

    useEffect(() => {
        setServices(category?.services.filter(item => item.status === 1))
    }, [category])
    
    useEffect(() => {
        console.log(services);
    }, [services])

    return (
        <>
            <div style={{height: "calc(100vh - 10rem)", overflowY: "auto"}}>
                <SelectList list={services ?? []} name={"service"} onChange={(event) => {
                    localStorage.setItem("selected_category", id)
                    localStorage.setItem("selected_service", event.target.value)
                    navigate("/create");
                    // console.log(event.target.value);
                }} style={{height: "100%"}} />
            </div>
            <Button onClick={() => {
                navigate("/home/services", {viewTransition: true})
            }} $size={"large"} style={{height: 55, borderRadius: 30, position: 'fixed', bottom: 20, margin: '0 5%', width: '86%'}}>Назад</Button>
        </>
    )
}