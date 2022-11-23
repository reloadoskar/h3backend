function agrupaVentas(ventas, filtro) {
    let reduce = ventas.reduce(function(grupos, venta) {
        (grupos[venta[filtro]] = grupos[venta[filtro]] || {[filtro]: venta[filtro], timporte:0, tcantidad:0,tempaques:0})        
        grupos[venta[filtro]].timporte += venta.importe
        grupos[venta[filtro]].tcantidad += venta.cantidad
        grupos[venta[filtro]].tempaques += venta.empaques
        return grupos;
    }, []);

    return Object.keys(reduce).map(key => reduce[key])
}

function agrupaItems(items, filtro){
    if(filtro === "producto"){
        let reduce = items.reduce(function(grupo, item){
            (grupo[item.producto._id] = grupo[item.producto._id] || { id: item.producto._id, [filtro] : item[filtro], stock:0, cantidad:0, empaques:0, empaquesStock:0, costo: item.costo})
            grupo[item.producto._id].stock += item.stock
            grupo[item.producto._id].cantidad += item.cantidad
            grupo[item.producto._id].empaques += item.empaques
            grupo[item.producto._id].empaquesStock += item.empaquesStock
            return grupo
        }, {})

        return Object.keys(reduce).map(key => reduce[key])
    }
}

function agrupaVentaItemsPorProducto(items, filtro){
    if(filtro === "producto"){
        let reduce = items.reduce(function(grupo, item){
            (grupo[item.producto._id] = grupo[item.producto._id] || { id: item.producto._id, [filtro] : item[filtro], compraItem:item.compraItem, cantidad:0, empaques:0, importe: item.importe})
            grupo[item.producto._id].cantidad += item.cantidad
            grupo[item.producto._id].empaques += item.empaques
            grupo[item.producto._id].importe += item.importe
            return grupo
        }, {})

        return Object.keys(reduce).map(key => reduce[key])
    }
}
function agrupaVentaItemsPorCompraItem(items){
    let reduce = items.reduce(function(grupo, item){
        (grupo[item.compraItem._id] = grupo[item.compraItem._id] || 
            { id: item.compraItem._id, 
                compraItem : item.compraItem, 
                ventas:[],
                compra: item.compra, 
                cantidad:0, 
                empaques:0, 
                importe: 0
            })
        grupo[item.compraItem._id].cantidad += item.cantidad
        grupo[item.compraItem._id].ventas.push(item)
        grupo[item.compraItem._id].empaques += item.empaques
        grupo[item.compraItem._id].importe += item.importe
        return grupo
    }, {})

    return Object.keys(reduce).map(key => reduce[key])
}
function agrupaVentaItemsPorVenta(items){
    let reduce = items.reduce(function(grupo, item){
        (grupo[item.ventaFolio] = grupo[item.ventaFolio] || 
            { id: item.ventaFolio, 
                venta: item.venta, 
                compra: item.compra, 
                items:[], 
                cantidad:0, 
                empaques:0, 
                importe: 0
        })
        grupo[item.ventaFolio].items.push( item)
        grupo[item.ventaFolio].cantidad += item.cantidad
        grupo[item.ventaFolio].empaques += item.empaques
        grupo[item.ventaFolio].importe += item.importe
        return grupo
    }, [])

    return Object.keys(reduce).map(key => reduce[key])
}

function agruparPor(arreglo, filtro){
    let reduce = arreglo.reduce((grupo, item)=>{
        (grupo[item[filtro]] =  grupo[item[filtro]] || {
            [filtro] : item[filtro],
            producto: item.producto,
            compra: item.compra,
            importe : 0,
            saldo: 0
        })
        grupo[item[filtro]].importe += item.importe
        if(item.saldo !== undefined){
            grupo[item[filtro]].saldo += item.saldo
        }
        return grupo
    },[])
    return Object.keys(reduce).map(key => reduce[key])
}
function agruparPorObjeto(arreglo, objeto){
    let reduce = arreglo.reduce((grupo, item)=>{
        let guardado = grupo.find(itm=> itm._id === item[objeto]._id)
        if(guardado){
            guardado.stockGlobal += parseFloat(item.stock)
            guardado.empaquesStockGlobal += parseFloat(item.empaquesStock)

            let existeItem = guardado.items.find(itm=> itm._id === item._id)
            if(existeItem && existeItem.compra === item.compra){
                existeItem.stock += item.stock
                existeItem.empaquesStock += item.empaquesStock
            }else{
                guardado.items.push(item)
            }
        }else{
            grupo.push({
                _id: item[objeto]._id,
                [objeto] : item[objeto],
                items: [item],
                stockGlobal:item.stock,
                empaquesStockGlobal: item.empaquesStock,
                producto: item.producto,
                compra: item.compra
            })
        }
        return grupo
    },[])
    return Object.keys(reduce).map(key => reduce[key])
}

module.exports = {agrupaVentas, 
    agrupaItems, 
    agruparPor, 
    agruparPorObjeto, 
    agrupaVentaItemsPorProducto,
    agrupaVentaItemsPorVenta,
    agrupaVentaItemsPorCompraItem
}