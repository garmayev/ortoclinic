import Button from "~/components/Button";
import {useNavigate, NavLink} from "react-router";
import {useAppContext} from "~/hooks/AppContext";
import {useEffect, useState} from "react";
import axios from "axios";
import {Helper} from "~/constant/Helper.ts";
import {styled} from "styled-components";
import arrow from "~/assets/arrow.png";

const Container = styled.div`
    margin-bottom: 80px;
`

const Card = styled(NavLink)`
    border-radius: calc(var(--border-radius) + 5px);
    width: calc(-40px + 100vw);
    background: rgba(255, 255, 255, 0.5);
    display: flex;
    font-family: 'Sylfaen',serif;
    flex-direction: row;
    margin-bottom: 3vw;
    padding: 10px;
    max-height: 150px;
    min-height: 120px;
    position: relative;
    text-decoration: none;
    
    & > img.promo-image {
        width: 40vw;
        border-radius: var(--border-radius);
    }
    & > div.promo-text {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: calc(100% - 40vw - 33px);
        padding: 0 10px;
        & > .after {
            display: flex;
            position: absolute;
            justify-content: center;
            align-items: center;
            width: 33px;
            height: 33px;
            border-radius: 50%;
            background: white;
            right: 10px;
            bottom: 10px;
        }
        & > p.promo-title {
            font-size: 21px;
            color: #841F82
        }
        & > div.promo-summary {
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #4B4B4BCC;
            font-size: 14px;
        }
    }
`

export default () => {
    const navigate = useNavigate();
    const {setTheme, setTitle, setUseOpacity, setBarVisible, loader} = useAppContext()
    const [promos, setPromos] = useState<Promo[]>([])

    useEffect(() => {
        loader.showFullscreenLoader()
        loader.setShowLoader(true);
        setTheme("static")
        setTitle("Акции");
        setUseOpacity(true)
        setBarVisible(false)
        const company_id = localStorage.getItem('company_id')
        axios.get(`/api/promo/index?filter[company_id]=${company_id}`)
            .then((response) => {
                if (response.data) {
                    setPromos(response.data)
                }
            })
            .finally(() => {
                loader.setShowLoader(false)
            })
    }, []);

    return (
        <>
            <Container className={"promo-container"}>
                {promos.map((item) => {
                    return (<Card className={"promo-item"} to={`/home/promo/${item.id}`}>
                        <img src={Helper.url + item.image} alt={item.title} className={"promo-image"} />
                        <div className={"promo-text"}>
                            <p className={"promo-title"}>{item.title}</p>
                            <div className={"promo-summary"} dangerouslySetInnerHTML={{ __html: item.summary }}></div>
                            <div className={"after"}>
                                <img src={arrow} alt={"arrow"} />
                            </div>
                        </div>
                    </Card>)
                })}
            </Container>
            <Button onClick={() => {
                navigate("/home", {viewTransition: true})
            }} $size={"large"} style={{height: 55, borderRadius: 30, position: 'fixed', bottom: 20, margin: '0 5%', width: '86%'}}>Назад</Button>
        </>
    )
}