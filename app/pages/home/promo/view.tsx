import Button from "~/components/Button";
import { useNavigate } from "react-router";
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {useAppContext} from "~/hooks/AppContext";
import {styled} from "styled-components";
import {Helper} from "~/constant/Helper.ts";

const Container = styled.div`
    text-align: center;
    margin-bottom: 80px;
    & > img.promo-image {
        width: calc(100vw - 40px);
        border-radius: var(--border-radius);
    }
`

export default () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const [promo, setPromo] = useState<Promo>();
    const {setTitle, loader} = useAppContext();
    
    useEffect(() => {
        loader.showFullscreenLoader()
        loader.setShowLoader(true);
        axios.get(`/api/promo/view?id=${id}`)
            .then(response => {
                if (response.status === 200) {
                    setPromo(response.data);
                    setTitle(response.data.title);
                }
            }) 
            .finally(() => {
                loader.setShowLoader(false);
            })
    }, [id])

    return (
        <>
            {promo && <Container>
                <img src={Helper.url + promo.image} alt={promo.title} className={"promo-image"} />
                <div dangerouslySetInnerHTML={{ __html: promo.summary }} />
                <div dangerouslySetInnerHTML={{ __html: promo.description }} />
            </Container>}
            <Button onClick={() => {
                navigate("/home/promo", {viewTransition: true})
            }} $size={"large"} style={{height: 55, borderRadius: 30, position: 'fixed', bottom: 20, margin: '0 5%', width: '86%'}}>Назад</Button>
        </>
    )
}